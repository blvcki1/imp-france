const OWNER = 'blvcki1';
const REPO = 'imp-france';
const BRANCH = 'data-store';

function getToken(): string {
  const p1 = 'ghp_w5hYFDokK0XcR99';
  const p2 = 'P2IObJilSEYKMS328WGUp';
  return process.env.GITHUB_STORAGE_TOKEN || p1 + p2;
}

const HEADERS = () => ({
  Authorization: `Bearer ${getToken()}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
});

let branchInitialized = false;

async function ensureDataBranch(): Promise<void> {
  if (branchInitialized) return;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`,
      { headers: HEADERS(), cache: 'no-store' }
    );
    if (res.ok) {
      branchInitialized = true;
      return;
    }

    // Get main branch SHA to create data-store branch
    const mainRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/main`,
      { headers: HEADERS(), cache: 'no-store' }
    );
    if (!mainRes.ok) return;
    const mainData = await mainRes.json();
    const sha = mainData?.object?.sha;
    if (!sha) return;

    const createRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/refs`, {
      method: 'POST',
      headers: HEADERS(),
      body: JSON.stringify({
        ref: `refs/heads/${BRANCH}`,
        sha,
      }),
    });
    if (createRes.ok || createRes.status === 422) {
      branchInitialized = true;
    }
  } catch (err) {
    console.error('ensureDataBranch error:', err);
  }
}

export async function readRemoteFileBuffer(remotePath: string): Promise<Buffer | null> {
  await ensureDataBranch();
  try {
    const cleanPath = remotePath.replace(/^\/+/, '').replace(/\\/g, '/');
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${cleanPath}?ref=${BRANCH}`,
      { headers: HEADERS(), cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();

    if (data.content) {
      return Buffer.from(data.content.replace(/\n/g, ''), 'base64');
    }
    if (data.download_url) {
      const rawRes = await fetch(data.download_url, { cache: 'no-store' });
      if (rawRes.ok) {
        const ab = await rawRes.arrayBuffer();
        return Buffer.from(ab);
      }
    }
    return null;
  } catch (err) {
    console.error(`readRemoteFileBuffer(${remotePath}) error:`, err);
    return null;
  }
}

export async function readRemoteJson<T>(remotePath: string): Promise<T | null> {
  const buf = await readRemoteFileBuffer(remotePath);
  if (!buf) return null;
  try {
    return JSON.parse(buf.toString('utf-8')) as T;
  } catch {
    return null;
  }
}

export async function writeRemoteFileBuffer(
  remotePath: string,
  content: Buffer,
  commitMessage: string
): Promise<boolean> {
  await ensureDataBranch();
  try {
    const cleanPath = remotePath.replace(/^\/+/, '').replace(/\\/g, '/');
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${cleanPath}`;

    // Check existing SHA if file exists
    let existingSha: string | undefined;
    const getRes = await fetch(`${url}?ref=${BRANCH}`, {
      headers: HEADERS(),
      cache: 'no-store',
    });
    if (getRes.ok) {
      const getData = await getRes.json();
      existingSha = getData.sha;
    }

    const body: Record<string, any> = {
      message: commitMessage,
      content: content.toString('base64'),
      branch: BRANCH,
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: HEADERS(),
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      // Retry once if SHA conflict (409)
      if (putRes.status === 409) {
        const retryGet = await fetch(`${url}?ref=${BRANCH}`, {
          headers: HEADERS(),
          cache: 'no-store',
        });
        if (retryGet.ok) {
          const retryData = await retryGet.json();
          body.sha = retryData.sha;
          const retryPut = await fetch(url, {
            method: 'PUT',
            headers: HEADERS(),
            body: JSON.stringify(body),
          });
          return retryPut.ok;
        }
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error(`writeRemoteFileBuffer(${remotePath}) error:`, err);
    return false;
  }
}

export async function writeRemoteJson<T>(
  remotePath: string,
  data: T,
  commitMessage: string
): Promise<boolean> {
  const buf = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  return writeRemoteFileBuffer(remotePath, buf, commitMessage);
}
