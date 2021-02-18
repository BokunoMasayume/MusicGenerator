type ADSRConfig = {
    attack: number;
    decay: number;
    sustain: number; 
    release: number;
} // 单位 毫秒

export class ADSREnveplope {
    private audiocontext: AudioContext;
    private gain: GainNode;
    private config : ADSRConfig;
    constructor (ac: AudioContext, con:ADSRConfig = {attack: 100, decay: 100, sustain: 200, release: 300} ) {
        this.audiocontext = ac;
        this.gain = ac.createGain();
        this.config = con;
    }
    public getNode() {
        return this.gain;
    }

    public adsr() {
        let {gain, audiocontext, config} = this;
        let count: number = config.attack;
        gain.gain.linearRampToValueAtTime(1, audiocontext.currentTime + count * 0.001);
        gain.gain.setTargetAtTime(0, audiocontext.currentTime + count + 0.001, config.decay * 0.001);
        count += config.decay;
        gain.gain.cancelAndHoldAtTime(audiocontext.currentTime + count * 0.001);
        count += config.sustain;
        gain.gain.setTargetAtTime(0, audiocontext.currentTime + count * 0.001, config.release * 0.001);
    }
}