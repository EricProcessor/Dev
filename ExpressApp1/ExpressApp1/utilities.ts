
export function replacePipesWithLineFeeds(s: string): string {
    return s.replace(/\|/g, '\x0A');
}

export async function getHeadCommit(): Promise<any> {
    return new Promise<any>(function (resolve, reject) {
        require('child_process').exec('git rev-parse HEAD', function (err, stdout) {
            if (err) {
                reject("");
            }
            else {
                resolve(stdout);
            }
        });
    });
}
