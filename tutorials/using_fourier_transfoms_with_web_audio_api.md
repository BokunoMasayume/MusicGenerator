# [通过Web Audio API使用傅立叶变换](https://www.sitepoint.com/using-fourier-transforms-web-audio-api/)

## Web Audio Oscillators

Web Audio API允许你组合一个音频元素的图来生产声音. 震荡器就是音频元素的一种, 是用来生产单纯音频信号的声音源.你可以设置它的频率和类型, 有sine, square, sawtooth, triangle, 除此之外, 待会我们还会看到, 还有一个强力的自定义类型.

## fourier Transforms By Example

傅立叶变换是许多音频压缩标准, 比如mp3等使用的数学工具. 逆傅立叶变换将信号分解为它的组成成分, 有点像人耳将震动处理成感知到的不同的音调.

在一个更高的层级, 傅立叶变换利用了一个复杂的信号可以被分解成增量式的独立的正弦曲线的这一事实. 它使用了系数表来进行工作, 每一个应用到一个基础的频率. 表越大, 模拟越近似. 

相比继续钻研理论, 让我们通过解析一个简单的连续音: 汽笛来进行实践.

## 分析喇叭

傅立叶变换有一个基频f, 和它的泛音(overtones), 也就是f的倍数. 如果我们选择160Hz作为我们的基频f, 320Hz就是我们的第一泛音(一次倍频), 480Hz就是我们的第二泛音(二次倍频), 以此类推.

因为上面的声频谱(没贴)展示了所有的线都是f的倍数, 所以一个每个f倍频的强度的数组足够表示这个录制声音.

Web Audio API文档告诉我们, createPeriodicWave可以从傅立叶系数创造自定义的波形. 它还有一个imag的参数, 我们可以忽略, 因为这个例子不涉及相位.

所以我们来创建一个系数列表(基于上面的音频谱明亮的部分, 选择:  0.4, 0.4, 1 , 1 , 1 ,0.3, 0.7, 0.6, 0.5, 0.9, 0.8).之后我们从这个表创建一个自定义震荡器, 并分析产生的声音.
```javascript
var audioContext = new AudioContext();
var osc = audioContext.createOscillator();

var real = new Float32Array([
  0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8
]);

var imag = new Float32Array(real.length);
var hornTable = audioContext.createPeriodicWave(real, imag);

osc = audioContext.createOscillator();
osc.setPeriodicWave(hornTable);
osc.frequency.value = 160;
osc.connect(audioContext.destination);
osc.start(0)
```

当然, 声音合成不仅仅是频谱, 包络(envelopes)也是音色中同样重要的一个方面.

## 从信号数据到傅立叶表

一般来说不会像我们上面做的那样手动创建傅立叶系数(也很少有声音像这个喇叭声音这么简单只包含泛音部分, 也就是f的整数倍部分). 傅立叶表是通过将真实信号数据喂给一个逆快速傅立叶变换(inverse FFT)算法来获得的.

[dsp.js](https://github.com/corbanbrook/dsp.js/)开源库让你可以从你自己的样本数据获取傅立叶参数. 现在我们会通过生产一个具体的波形来展示这一点.

## 低频震荡器 —— 警笛声

警笛声在一个较高和一个较低的频率之间. 我们可以用两个震荡器来实现. 第一个震荡器(一个低频震荡器LFO)调制第二个震荡器的声音, 第二震荡器实际产生音频波形.

为了解构这件事, 像最开始一样, 让我们看一下警笛声的音频谱.

区别于水平的直线, 我们可以看见鲨鱼牙齿形状的模型. 标准的震荡器只支持sine, square, sawtooth和triangle形状的波形.所以我们需要创建自定义的波形.

首先, 我们需要一组数值来表示想要的曲线, 像下面这个, 我们管它叫sharkFinValues.

[这个](https://codepen.io/Clafou/pen/rNrMXB)

然后, 我们使用dsp.js来从形状计算傅立叶系数.
```javascript
var ft = new DFT(sharkFinValues.length);
ft.forward(sharkFinValues);
var lfoTable = audioContext.createPeriodicWave(ft.real, ft.imag);
```

最后, 我们创建第二个震荡器, 并把LFO链接到它的frequency, 通过一个gain node 来放大LFO的输出. 我们的声谱图显示这个波形的持续时间是380ms, 因此我们把LFO的频率设置为1/ 0.38. 它同时显示了LFO的频率是在750Hz和1650Hz之间(1200Hz +- 450Hz). 所以我们设置频率为1200Hz, LFO的gain为450.

```javascript
osc = audioContext.createOscillator();
osc.frequency.value = 1200;

lfo = audioContext.createOscillator();
lfo.setPeriodicWave(lfoTable);
lfo.frequency.value = 1/0.380;

lfoGain = audioContext.createGain();
lfoGain.gain.value = 450;

lfo.connect(lfoGain);
lfoGain.connect(osc.frequency);
osc.connect(audioContext.destination);

osc.start(0);
lfo.start(0);
```

为了整点真实感, 可以给第二个震荡器也添点泛音, 就像上面的喇叭一样.

