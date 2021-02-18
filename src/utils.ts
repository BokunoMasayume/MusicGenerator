const Frequences = ['C', 'C$', 'D', 'D$', 'E', 'F', 'F$', 'G', 'G$', 'A', 'A$', 'B'];
export function generateFrequenceMap(baseFre: number, step: number): {[filename:string]: number;} {
    let freMap = {};
    for (let i = 0; i < Frequences.length; i++) {
        if (!i) {
            freMap[Frequences[i]] = baseFre;
        } else {
            freMap[Frequences[i]] = freMap[Frequences[i-1]] * step;
        }
    }
    return freMap;
}

/**
 * 
 * @param time 停顿时间, 单位 毫秒
 * @returns time 停顿时间 单位 毫秒
 */
export function timeHolder(time : number) {
    return new Promise((res) => {
        setTimeout(() => {
            res(time);
        }, time);
    });
}