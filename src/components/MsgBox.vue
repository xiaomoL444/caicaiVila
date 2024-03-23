e<template>
    <div class="MsgBox">
        <!-- 系统消息 -->
        <div v-if="msg.msgType.indexOf('MHY:SYS') != -1">
            <div class="SystemMessage">
                <!-- 新房间信息 -->
                <div v-if="msg.msgType == 'MHY:SYS:VillaRoomCreated'">欢迎来到{{ room_name }}~</div>
                <!-- 置顶信息 -->
                <div v-else-if="msg.msgType == 'MHY:SYS:PinMessage'">
                    {{ msg.msgContent.user.name }}{{ msg.msgContent.content.operation == 'pin' ? '置顶' : '取消置顶' }}了一条消息{{
            msg.msgContent.content.message_id }}</div>
                <!-- 活跃标识信息 -->
                <div v-else-if="msg.msgType == 'MHY:SYS:VillaActiveLabelNotify'">
                    {{
            msg.msgContent.content.notify_content.replace("%members",
                msg.msgContent.content.members).replace("%active_label",
                    active_label[msg.msgContent.content.label_id
                    - 1]) }}</div>
                <!-- 禁言消息 -->
                <div v-else-if="msg.msgType == 'MHY:SYS:BannedToSendMessage'">{{ msg.msgContent.content.user.nickname
                    }}被禁言{{ msg.msgContent.content.duration / 60 }}分钟，原因：{{ msg.msgContent.content.reason }}</div>
                <!-- 房间直播 -->
                <div v-else-if="msg.msgType == 'MHY:SYS:RoomLiveStateUpdated'">
                    <div v-if="msg.msgContent.content.event == 'play'">{{ msg.msgContent.user.name }}开启了直播</div>
                    <div v-if="msg.msgContent.content.event == 'cancel'">{{ msg.msgContent.user.name }}关闭了直播</div>
                </div>
                <!-- 用户加入房间 -->
                <div v-else-if="msg.msgType == 'MHY:SYS:UserJoinVilla'">
                    <div>{{ msg.msgContent.user.name }}加入~</div>
                </div>
                <!-- 错误信息 -->
                <div v-else>无法识别的消息{{ msg.msgType }}{{ msg.msgContent }}</div>
            </div>
        </div>
        <!-- 用户消息 -->
        <div v-else-if="msg.msgType.indexOf('MHY') != -1">
            <div
                v-if="index == 0 || msgCollection[index - 1].msgType.indexOf('MHY:SYS') != -1 || ((msgCollection[index - 1].msgContent.user != 0) && (msg.msgContent.user.id != msgCollection[index - 1].msgContent.user.id)) || (msg.msgTime != 0 && msgCollection[index - 1].msgTime == 0) || ((msg.msgTime != 0 && msgCollection[index - 1].msgTime != 0) && (Math.abs(msg.msgTime - msgCollection[index - 1].msgTime) >= 300 * 1000))">
                <!-- 时间信息 -->
                <div v-if="index <= 0 || (msg.msgTime != 0 && msgCollection[index - 1].msgTime == 0) || ((msg.msgTime != 0 && msgCollection[index - 1].msgTime != 0) && (Math.abs(msg.msgTime - msgCollection[index - 1].msgTime) >= 300 * 1000))"
                    class="SystemMessage">{{ Time(parseInt(msg.msgTime) + standTimeEpoch) }}</div>

                <div class="UserInfo">

                    <img class="AvatarImg" :src="msg.msgContent.user.portraitUri">
                    <div class="PlayerName">{{ msg.msgContent.user.name }}
                        <div class="MemberRole"
                            :style="{ backgroundColor: JSON.parse(msg.msgContent.user.extra).member_roles.web_color, color: '#FFFFFF' }">
                            {{ JSON.parse(msg.msgContent.user.extra).member_roles.name }}</div>
                    </div>
                    <div style="clear:both"></div>
                </div>
            </div>
            <div class="ChatBox" :id="msg.msgID">
                <div class="Content">
                    <!-- 文字 -->
                    <div v-if="msg.msgType == 'MHY:Text'" class="text" :id="msg.msgID+'_text'">
                        <!-- 引用消息 -->
                        <div v-if="msg.msgContent.content.quote != undefined" class="quote"
                            v-on:click="ViewMsg(msg.msgContent.content.quote.quoted_message_id, true)">
                            <div class="line"></div> {{
            quoteCollection[msg.msgContent.content.quote.quoted_message_id]== undefined ? "" :
                quoteCollection[msg.msgContent.content.quote.quoted_message_id].text }}
                        </div>
                        <div v-html="TextHightLight(msg.msgContent).content.text.replace(reg, replaceDbyEmotion)"></div>
                        <div v-for="image in msg.msgContent.content.images" :key="image">
                            <img class="img"
                                :style="{ height: image.size.height / image.size.width * 10 + 'rem', width: '10rem' }"
                                v-on:click="ViewImage(image.url)" :src="image.url">
                        </div>
                        <div v-if="msg.msgContent.panel != undefined">
                            <div v-for="group in msg.msgContent.panel.group_list" :key="group" class="Panel">
                                <div v-for="item in group" :key="item" class="item">{{ item.text }}</div>
                            </div>
                        </div>
                    </div>
                    <!-- 图片 -->
                    <div v-else-if="msg.msgType == 'MHY:Image'"><img class="img" loop="true"
                            :style="{ height: msg.msgContent.content.size.height / msg.msgContent.content.size.width * 10 + 'rem', width: '10rem' }"
                            v-on:click="ViewImage(msg.msgContent.content.url)" :src="msg.msgContent.content.url"></div>
                    <!-- 虚拟互动 -->
                    <div v-else-if="msg.msgType == 'MHY:HoYomoji'"><img class="text" loop="true"
                            :style="{ height: msg.msgContent.content.size.height / msg.msgContent.content.size.width * 10 + 'rem', width: '10rem' }"
                            :src="msg.msgContent.content.url">
                        <div class="smallText">{{ msg.msgContent.content.text }}</div>
                    </div>
                    <!-- 自定义表情包 -->
                    <div v-else-if="msg.msgType == 'MHY:CustomEmoticon'"><img loop="true" class="img"
                            :style="{ height: msg.msgContent.content.size.height / msg.msgContent.content.size.width * 10 + 'rem', width: '10rem' }"
                            :src="msg.msgContent.content.url">
                    </div>
                    <!-- 米社表情包 -->
                    <div v-else-if="msg.msgType == 'MHY:Emoticon'" class="img"
                        style="width: 5rem;height:5rem;background-color: transparent;"
                        v-html="MHYEmotion(msg.msgContent.content.emoticon)"></div>
                    <!-- 虚拟小人个人互动？ -->
                    <div v-else-if="msg.msgType == 'MHY:AvatarEmoticon'"><img loop="true" class="text"
                            :style="{ height: msg.msgContent.content.size.height / msg.msgContent.content.size.width * 10 + 'rem', width: '10rem' }"
                            :src="msg.msgContent.content.url"></div>
                    <!-- 虚拟小人骰子 -->
                    <div v-else-if="msg.msgType == 'MHY:RandomEmoticon'"><img class="text"
                            :src="msg.msgContent.content.url"
                            :style="{ height: msg.msgContent.content.size.height / msg.msgContent.content.size.width * 10 + 'rem', width: '10rem' }">
                    </div>
                    <!-- 别野表情 -->
                    <div v-else-if="msg.msgType == 'MHY:VillaEmoticon'"><img class="img"
                            :src="msg.msgContent.content.url"
                            :style="{ height: msg.msgContent.content.size.height / msg.msgContent.content.size.width * 10 + 'rem', width: '10rem' }">
                    </div>
                    <!-- 帖子 -->
                    <div v-else-if="msg.msgType == 'MHY:Post'">
                        <a :href="'https://www.miyoushe.com/ys/article/' + msg.msgContent.content.post_id">
                            <div class="Post">
                                <img class="img" src="https://bbs-static.miyoushe.com/avatar/avatar30024.png">
                                <div class="title">标题~</div>
                                <div class="subject">{{ msg.msgContent.content.subject }}</div>
                                <div class="divingLine"></div>
                                <div class="detail">post_id:{{ msg.msgContent.content.post_id }}</div>
                            </div>
                        </a>
                    </div>
                    <!-- 别野分享卡片 -->
                    <div v-else-if="msg.msgType == 'MHY:VillaCard'">
                        <a :href="'https://dby.miyoushe.com/chat/' + msg.msgContent.content.villa_id">
                            <div class="Post">
                                <img class="img" src="https://bbs-static.miyoushe.com/avatar/avatar30024.png">
                                <div class="title">邀请你加入「{{ msg.msgContent.content.villa_name }}」</div>
                                <div class="subject">简介</div>
                                <div class="divingLine"></div>
                                <div class="detail">很多人来过哦~</div>
                            </div>
                        </a>
                    </div>
                    <!-- 别野内部帖子分享 -->
                    <div v-else-if="msg.msgType == 'MHY:ShareVillaPost'">
                        <a :href="'https://dby.miyoushe.com/chat/' + 0">
                            <div class="Post">
                                <img class="img" src="https://bbs-static.miyoushe.com/avatar/avatar30024.png">
                                <div class="title">{{ msg.msgContent.content.title }}</div>
                                <div class="subject">{{ msg.msgContent.content.subject }}</div>
                                <div class="divingLine"></div>
                                <div class="detail">大别野帖子</div>
                            </div>
                        </a>
                    </div>
                    <!-- 机器人分享 -->
                    <div v-else-if="msg.msgType == 'MHY:RobotCard'">
                        <a :href="'https://dby.miyoushe.com/chat/' + 0">
                            <div class="Post">
                                <img class="img" src="https://bbs-static.miyoushe.com/avatar/avatar30024.png">
                                <div class="title">{{ msg.msgContent.content.name }}</div>
                                <div class="subject">{{ msg.msgContent.content.bot_id }}</div>
                                <div class="divingLine"></div>
                                <div class="detail">机器人分享</div>
                            </div>
                        </a>
                    </div>
                    <!-- 精选消息 -->
                    <div v-else-if="msg.msgType == 'MHY:MessageSpotlightCollection'">
                        <a :href="'https://dby.miyoushe.com/chat/' + 0">
                            <div class="Post">
                                <img class="img" src="https://bbs-static.miyoushe.com/avatar/avatar30024.png">
                                <div class="title" style="top:0.5rem">{{ msg.msgContent.content.title }}</div>
                                <div v-for="(content, index) in  msg.msgContent.content.summary_list " :key="content">
                                    <div class="subject" :style="{ top: 1.5 + 1.1 * index + 'rem' }">{{ content.nickname
                                        }}:{{ content.content }}</div>
                                </div>

                                <div class="divingLine"></div>
                                <div class="detail"><img
                                        style="width: 1.2rem; height: 1.2rem; position:relative;bottom:-0.25rem; border-radius: 90px;padding-right: 0.5rem;"
                                        :src="msg.msgContent.content.author_avatar">{{ msg.msgContent.content.author
                                    }}精选的消息</div>
                            </div>
                        </a>
                    </div>
                    <!-- 消息转发 -->
                    <div v-else-if="msg.msgType == 'MHY:ForwardMsg'">
                        <a :href="'https://dby.miyoushe.com/chat/' + 0">
                            <div class="Post">
                                <img class="img" src="https://bbs-static.miyoushe.com/avatar/avatar30024.png">
                                <div class="title" style="top:0.5rem">{{ msg.msgContent.content.room_name }}</div>
                                <div v-for="(content, index) in  msg.msgContent.content.summary_list " :key="content">
                                    <div class="subject" style="text-wrap:balance;"
                                        :style="{ top: 1.8 + 1.1 * index + 'rem' }">{{
            content.nickname
        }}:{{ content.content }}</div>
                                </div>

                                <div class="divingLine"></div>
                                <div class="detail">来自：{{ msg.msgContent.content.room_name }}</div>
                            </div>
                        </a>
                    </div>
                    <!-- 错误信息 -->
                    <div v-else class="SystemMessage">无法识别的消息{{ msg.msgType }}{{ msg.msgContent }}</div>
                    <!-- 徽标信息 -->
                    <div v-if="msg.msgContent.content.badge != undefined">
                        <a :href="msg.msgContent.content.badge.url">
                            <div class="badge"><img loop="true" class="img"
                                    :src="msg.msgContent.content.badge.icon_url">{{
                                msg.msgContent.content.badge.text }}</div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <!-- 错误信息 -->
        <div v-else class="SystemMessage">无法识别的消息{{ msg.msgType }}{{ msg.msgContent }}
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';
import {
    quoteCollection,
    active_label,
    ViewMsg,
    ViewImage,
    room_name,
    Time,
    standTimeEpoch,
    reg,
    replaceDbyEmotion,
    MHYEmotion,
    TextHightLight
} from './CaicaiVila.vue'

defineProps({
    msgCollection: Object,
    msg: Object,
    index: Number
});
</script>