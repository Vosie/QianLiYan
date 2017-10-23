export default {
    rss: {
        item_text_separator: ', '
    },
    tts_player: {
        // tts is a group of system message for hinting the start of TTS playing
        // So, we will use TTS to read the text here.
        tts: {
            play_content: 'content: {{content}}',
            play_title: 'title: {{title}}',
            resume_playing: 'resume playing: {{title}}'
        },
        sentence_separator: '.'
    },
    errors: {
        1001: 'Player tries to play inexisting text.',
        1002: 'Player exits the playing state.'
    }
};
