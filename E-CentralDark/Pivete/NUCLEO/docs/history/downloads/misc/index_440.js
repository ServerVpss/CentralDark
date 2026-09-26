import process from 'node:process';

const isInSsh = Boolean(process.env.SSH_CONNECTION
	|| process.env.SSH_CLIENT
	|| process.env.SSH_TTY);

export default isInSsh;
n hasDockerCGroup() {
	try {
		return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
	} catch {
		return false;
	}
}

export default function isDocker() {
	// TODO: Use `??=` when targeting Node.js 16.
	if (isDockerCached === undefined) {
		isDockerCached = hasDockerEnv() || hasDockerCGroup();
	}

	return isDockerCached;
}
