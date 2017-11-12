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
            resume_playing: 'resume playing: {{title}}',
            start_of_list: 'this is no conetnt before this one',
            end_of_list: 'there is no content for reading',
            no_playable: 'we cannot find any content which can play currently',
            no_text: 'the content of this article isn\'t downloaded'
        },
        sentence_separator: /(?:\.|\?|:|,)/gi
    },
    errors: {
        1001: 'Player tries to play inexisting text.',
        1002: 'Player exits the playing state.'
    }
};
