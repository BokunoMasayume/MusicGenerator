export class SoundSource {
    private audiocontext: AudioContext;
    private oscillator: OscillatorNode;
    constructor(ac: AudioContext) {
        this.audiocontext = ac;
        this.oscillator = ac.createOscillator();
    }
    public getNode () {
        return this.oscillator;
    }
    // 滑弦, 直接变啥的
    public setFrequency(fre: number) {
        this.oscillator.frequency.value = fre;
    }
}