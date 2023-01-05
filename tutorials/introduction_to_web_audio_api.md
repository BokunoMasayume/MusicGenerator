# [介绍Web Audio API](https://css-tricks.com/introduction-web-audio-api/)

Web Audio API让我们在浏览器中制作正确的声音. 它使你的网站, 应用以及游戏更加有趣动人. 你甚至可以制作像鼓模拟器, 合成器之类的音乐应用. 在这篇文章中, 我们将通过制作一些有趣并且简单的工程来学习Web Audio API.

## 开始

我们先来学习一些术语. Web Audio API所有的音频操作都在一个audio context里. 每一个基础的音频操作都是通过链接到一起的audio nodes, 形成audio routing graph实现的.在播放任何声音之前, 你需要创建audio context. 这和你创建一个context来在canvas上进行绘制很像(但是比canvas webgl context好多了! canvas context现在的实现方法适合canvas 2d, 但还是audio context这种组织方式适合webgl context).下面是我们如何创建一个audio context:

```javascript
var context = new (window.AudioContext || window.webkitAudioContext)();
```

Safari要求一个webkit前缀.

通常Web Audio API的工作流像下面这样:

<div style="display: flex; justify-content: space-between;">
<div>Create audio context  --></div>
<div>Create source --></div>
<div>Connect filter nodes --></div>
<div>Connect to destination</div>
</div>

一共有三种类型的source:

1. Oscillator(震荡器) - 数学计算的声音
2. Audio Samples - 来自音频/视频文件
3. Audio Stream - 音频来自webcam或者麦克风

## 从震荡器开始

一个震荡器是一个重复的波形. 它有频率和波峰振幅. 振荡器最重要的feature之一, 除了它的频率和波峰振幅, 是波形的形状. 有四种最常用的波形: sine(正弦波), triangle(三角波), square(方波), sawtooth(锯齿波).
也可以创建自定义的波形. 不同的波形适合不同的合成技术, 能产生从平滑到刺耳的不同的声音.

Web Audio API使用震荡器节点来表示重复的波形. 我们可以用上面的所有波形: 

```javascript
OscillatorNode.type = 'sine' | 'square' | 'triangle' | 'sawtooth';
```

你也可以使用傅立叶变换创建自定义波形. 如果你想要学习更多关于自定义波形的东西(比如做一个报警器的波形), 你可以看[这个](https://www.sitepoint.com/using-fourier-transforms-web-audio-api/).

## 运行震荡器

现在搞些声音, 我们要做下面的这些事:

1. 创建Web Audio API上下文
2. 在上下文中创建振荡器节点
3. 选择波形类型
4. 设置频率
5. 链接震荡器到目的节点
6. 开启震荡器

```javascript
var context = new (window.AudioContext || window.webkitAudioContext)();

var oscillator = context.createOscillator();

oscillator.type = 'sine';
oscillator.frequency.value = 440;
oscillator.connect(context.destination);
oscillator.start();
```

现在来让音量可调节. 为此我们要创建一个gain节点, 并链接到链条里, 然后把gain链接到destination.

```javascript
var gain = context.createGain();
oscillator.connect(gain);
gain.connect(context.destination);

var now = context.currentTime;
gain.gain.setValueAtTime(1, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
oscillator.start(now);
oscillator.stop(now + 0.5);
```

## Web Audio API的时序

在构建音频软件的时候最重要的事情之一是管理时间. 考虑到需要的精度, javascript clock并不是最佳的选择, 因为它的精度不够. Web Audio Context有currentTime这个属性, 是一个逐渐增大的双精度硬件时间戳(单位: 秒), 可以用来管理音频的播放. 它从audio context声明开始从0计时. 

如果你想让振荡器立刻开始播放, 你需要调用oscillator.start(0), 也可以不传0, 因为0是默认参数.你也可能想要让它在一秒之后播放, 播放两秒之后停止:

```javascript
var now = context.currentTime;
oscillator.play(now + 1);
oscillator.stop(now + 3);
```

AudioParam.setValueAtTime(value, startTime)方法管理了高精度时间下的值变化管理. 比如, 如果你想要在一秒内改变振荡器的频率: 

```javascript
oscillator.frequency.setValueAtTime(261.6, context.current + 1);
```

你也可以直接修改属性的value属性, 但是如果和automation events(通过AudioParam方法使用的事件管理)同时发生, 直接设置会被忽略, 并且不会报错.

AudioParam.exponentialRampToValueAtTime(value, endTime)方法管理值的平滑过渡. 下面这个代码会在一秒内指数式的减少震荡器的音量

```javascript
gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1);
```

endTime不能使用0, 而必须是一个正数.

## 创建Sound类

一旦你停止一个震荡器, 你就不能再次启动它了, 这个是Web Audio API做的性能优化. 我们需要做的是创建一个sound类来负责创建震荡器节点, 播放和停止节点. 这样我们就可以多次播放声音了.