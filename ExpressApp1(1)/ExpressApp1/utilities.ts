//用管路进料 来 更换管道（就是一个 正则表达式替换）
export function replacePipesWithLineFeeds(s: string): string {
    return s.replace(/\|/g, '\x0A');
}

//获取头部提交内容
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
