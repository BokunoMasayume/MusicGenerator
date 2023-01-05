import { SoundSource } from "./SoundSource";
import { ADSRConfig, ADSREnveplope } from "./ADSREnvelope";
import { generateFrequenceMap, timeHolder } from "./utils";

const defaultConfig = {
  base: 440, // A 的频率， 单位 hz
  meter: 1000, // 一拍的长度， 单位 ms
};

type MusicGeneratorConfig = {
  base: number;
  meter: number;

  adsrConfig?: ADSRConfig;
};

type MusicSheet = (number | string)[]; // frequency : time in METER

enum MusicGeneratorState {
  Idle,
  Playing,
  Pause,
  Stopped,
}

// type FrequencyMap = {
//     C:number;
//     C$: number;
//     D:number;
//     D$:number;
//     E:number;
//     F:number;
//     G:number;
//     G$:number;
//     A:number;
//     A$:number;
//     B:number;
// };
type FrequencyMap = {
  [filename: string]: number;
};
export class MusicGenerator {
  constructor(config: Partial<MusicGeneratorConfig> = {}) {
    let con: MusicGeneratorConfig = Object.assign({}, defaultConfig, config);
    this._base = con.base;
    this._meter = con.meter;
    this.f0 = con.base / Math.pow(MusicGenerator.step, 9);
    this._frequencyMap = generateFrequenceMap(this.f0, MusicGenerator.step);

    this.audiocontext = new AudioContext();

    this.source = new SoundSource(this.audiocontext);
    this.envelope = new ADSREnveplope(this.audiocontext, config.adsrConfig);
    this.connect();
  }
  // 2^(1/12)
  static step = 1.059463094359295;

  private audiocontext: AudioContext;
  private source: SoundSource;
  private envelope: ADSREnveplope;

  private sheet?: MusicSheet;

  // A 的频率
  private _base: number;
  public get base(): number {
    return this._base;
  }
  public set base(b: number) {
    //  anchor f0, map 也要跟着改
    this._base = b;
  }

  // 节拍
  private _meter: number;
  public get meter(): number {
    return this._meter;
  }
  public set meter(m: number) {
    this._meter = m;
  }

  // C 的频率
  private f0: number;

  private _frequencyMap: FrequencyMap;
  get frequencyMap(): FrequencyMap {
    return this._frequencyMap;
  }
  set frequencyMap(fm: FrequencyMap) {
    this._frequencyMap = fm;
  }

  private _state: MusicGeneratorState = MusicGeneratorState.Idle;

  /**
   * 链接使用的节点, 目前有oscillator, gain, destination
   */
  private connect() {
    this.source.getNode().connect(this.envelope.getNode());
    this.envelope.getNode().connect(this.audiocontext.destination);
  }

  public async playOne(fre: number | string, time: number): Promise<void> {
    let { envelope, source, frequencyMap } = this;
    let frequency = fre;
    if (!(typeof fre === "number" || (fre as any) instanceof Number)) {
      frequency = frequencyMap[fre];
    }
    envelope.adsr();
    source.setFrequency(frequency as number);
    await timeHolder(time);
  }

  public setSheet(sheet: MusicSheet) {
    this.sheet = sheet;
  }

  public async playSheet() {
    if (this._state === MusicGeneratorState.Playing) {
      return;
    }
    this._state = MusicGeneratorState.Playing;
    let { sheet, source, meter } = this;
    if (!sheet) {
      console.warn("Warinning in playSheet, sheet not been set");
      return;
    }
    // source.getNode().stop();
    try {
      source.getNode().start();
    } catch (e) {}
    for (let i: number = 0; i < sheet.length; i += 2) {
      await this.playOne(sheet[i], (sheet[i + 1] as number) * meter);
    }
    this._state = MusicGeneratorState.Stopped;
  }
}
