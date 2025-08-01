# Audio Files for Animal Movement System

This directory should contain the following audio files for the randomized animal system:

## Birds (Up Movement)
- `eagle.mp3` - Eagle/Hawk/Falcon sounds
- `eagle_danger.mp3` - Distressed eagle sounds
- `dove.mp3` - Dove/Pigeon sounds  
- `dove_danger.mp3` - Distressed dove sounds
- `duck.mp3` - Duck/Goose sounds
- `duck_danger.mp3` - Distressed duck sounds
- `bee.mp3` - Bee/Wasp sounds
- `bee_danger.mp3` - Angry bee sounds

## Ground Animals (Down Movement)
- `mole.mp3` - Mole/Hedgehog sounds
- `mole_danger.mp3` - Angry mole sounds
- `snake.mp3` - Snake hissing sounds
- `snake_danger.mp3` - Aggressive snake sounds
- `lizard.mp3` - Lizard/Gecko sounds
- `lizard_danger.mp3` - Distressed lizard sounds
- `spider.mp3` - Spider/Arachnid sounds
- `spider_danger.mp3` - Aggressive spider sounds

## Left Movement Animals
- `wolf.mp3` - Wolf/Dog howling
- `wolf_danger.mp3` - Aggressive wolf sounds
- `cat.mp3` - Cat meowing/purring
- `cat_danger.mp3` - Angry cat sounds
- `raccoon.mp3` - Raccoon chittering
- `raccoon_danger.mp3` - Aggressive raccoon sounds
- `squirrel.mp3` - Squirrel chattering
- `squirrel_danger.mp3` - Angry squirrel sounds

## Right Movement Animals
- `horse.mp3` - Horse neighing/galloping
- `horse_danger.mp3` - Rearing horse sounds
- `deer.mp3` - Deer/Elk sounds
- `deer_danger.mp3` - Distressed deer sounds
- `cow.mp3` - Cow mooing
- `cow_danger.mp3` - Angry bull sounds
- `goat.mp3` - Goat bleating
- `goat_danger.mp3` - Angry goat sounds

## File Format Requirements
- Format: MP3 or WAV
- Duration: 0.5-2 seconds recommended
- Volume: Normalized for consistent playback
- Quality: 44.1kHz, 16-bit minimum

## Usage
The game will automatically try to load these files. If a file is missing, it will fall back to generated sounds using Web Audio API.
