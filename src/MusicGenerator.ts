const defaultConfig = {
    base: 440, // A 的频率， 单位 hz
    meter: 1000, // 一拍的长度， 单位 ms
};

type MusicGeneratorConfig = {
    base:number;
    meter: number;
}

type FrequencyMap = {
    C:number;
    C$: number;
    D:number;
    D$:number;
    E:number;
    F:number;
    G:number;
    G$:number;
    A:number;
    A$:number;
    B:number;
};

export class MusicGenerator {
    constructor (config: {base?:number; meter?:number}) {
        let con:MusicGeneratorConfig = Object.assign({}, defaultConfig, config);
        this.base = con.base;
    }
    // 2^(1/12)
    static step = 1.059463094359295;

    private audiocontext: AudioContext;
    private oscillator: OscillatorNode;

    // A 的频率
    private _base: number ;
    public get base():number {
        return this._base;
    }
    public set base(b:number) {
        //  anchor f0, map 也要跟着改
        this._base = b;
    }

    // 节拍
    private _meter:number;
    public get meter():number {
        return this._meter;
    }
    public set meter(m:number) {
        this._meter = m;
    }

    // C 的频率
    private f0:number;

    private _frequencyMap:FrequencyMap;
    get frequencyMap():FrequencyMap {
        return this._frequencyMap;
    }

}