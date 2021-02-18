import { MusicGenerator } from './MusicGenerator';

let musicGenerator = new MusicGenerator({});
musicGenerator.setSheet([
    'C', .5,
    'D', .5,
    'E', .5,
    'C', .5,

    'C', .5,
    'D', .5,
    'E', .5,
    'C', .5,

    'E', .5,
    'F', .5,
    'G', 1,

    'E', .5,
    'F', .5,
    'G', 1,
]);

musicGenerator.playSheet();