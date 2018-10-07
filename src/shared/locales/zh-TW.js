export default {
    app: {
        add_rss: '新增 RSS 內容',
        all_items: '所有 RSS 內容',
        app_name: '千里眼',
        rss_list: 'RSS 清單'
    },
    rss: {
        item_text_separator: '，'
    },
    tts_player: {
        tts: {
            play_content: '本文：{{content}}',
            play_title: '標題：{{title}}',
            resume_playing: '回復播放：{{title}}',
            start_of_list: '這已經是第一篇文章，無法再往前',
            end_of_list: '無內容可報讀了',
            no_playable: '目前沒有可播放的內容',
            no_text: '本篇文章尚未被下載及處理完成'
        },
        sentence_separator: /(?:，|。|：|！|？|、)/gi
    },
    errors: {
        1001: '播放器企圖去播放一個不存在的文字。',
        1002: '播放器已退出播放狀態。'
    }
};
