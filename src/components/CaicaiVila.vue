<template>
  <meta charset="UTF-8" />
  <link rel="stylesheet" type="text/css" href="/css/style.css" />
  <link rel="stylesheet" type="text/css" href="/css/MsgScrollBoxStyle.css" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  />

  <!-- 浏览图片 -->
  <div v-if="viewImage" class="ViewImage" v-on:click="viewImage = false">
    <img class="img" :src="viewImageUrl" />
  </div>

  <div>
    <!-- 标题区域 -->
    <div class="TitleArea">
      <img
        class="RoomListButton"
        src="../assets/roomList.png"
        v-on:click="RoomList('open')"
      />
      <img
        class="SearchButton"
        src="../assets/search.png"
        v-on:click="
          filteruser = { id: 0, name: '' };
          msgToSearch = '';
          filteruserName = '';
          search_msgCollection = [];
          SearchPanel('open');
        "
      />
      <div class="Title">{{ room_name }}</div>
    </div>
    <!-- 消息框 -->
    <div class="ScrollBox" id="MessageScrollBox" @scroll="MessageBoxScroll">
      <div
        v-if="pin_msgCollection.length > 0"
        class="PinMsgBox"
        id="PinMsgBox"
        v-on:click="PinMsgPanel('open')"
      >
        <img src="../assets/pin.png" style="width: 1em; vertical-align: middle" /><span
          style="color: #14c4fa; padding-left: 0.5rem; padding-right: 0.1rem"
          >{{ pin_msgCollection.length }}条</span
        >{{
          pin_msgCollection[0].msgType == "MHY:Text"
            ? pin_msgCollection[0].msgContent.content.text
            : ""
        }}
        {{ pin_msgCollection[0].msgType == "MHY:Image" ? "[图片]" : "" }}
        {{ pin_msgCollection[0].msgType == "MHY:Post" ? "[帖子]" : "" }}
        {{ pin_msgCollection[0].msgType == "MHY:ShareVillaPost" ? "[帖子]" : "" }}
      </div>
      <div v-for="(msg, index) in msgCollection" :key="msg">
        <MsgBox :msgCollection="msgCollection" :msg="msg" :index="index"></MsgBox>
      </div>
      <div style="position: relative; height: 1rem"></div>
    </div>
    <!-- 底部区域 -->
    <div class="SendArea">
      <div class="InputBox">你没有该房间的发言权限</div>
    </div>
  </div>

  <!-- 置顶消息列表 -->
  <div class="VillaCollection" id="PinMsg" style="left: 100vw">
    <div class="BackGround" id="PinMsg_bg" v-on:click="PinMsgPanel('close')"></div>
    <div
      class="ItemArea"
      id="PinMsg_items"
      style="background-color: #f0f3f5; width: 85vw"
    >
      <div v-if="isRefreshing == false" class="ScrollBox">
        <div
          v-for="(msg, index) in pin_msgCollection"
          :key="msg"
          v-on:click="
            PinMsgPanel('close');
            ViewMsg(msg.msgID, true);
          "
        >
          <MsgBox :msgCollection="pin_msgCollection" :msg="msg" :index="index"></MsgBox>
        </div>
      </div>
    </div>
  </div>

  <!-- 发送区域 -->
  <div v-if="isRefreshing" class="WaitArea">
    <div style="position: absolute; bottom: 15rem; left: 35vw">
      <img
        class="WaitIcon"
        style="animation: rotate 1s infinite linear"
        src="../assets/waitSending.png"
      />
      消息获取中...
    </div>
  </div>

  <!-- 切换房间列表 -->
  <div class="VillaCollection" id="villa_collection">
    <div class="BackGround" id="villa_collection_bg" v-on:click="RoomList('close')"></div>
    <div class="ItemArea" id="villa_collection_items">
      <div class="JumpArea">
        <button
          class="Button"
          v-on:click="
            nextTick(() => {
              ClearMsg();
            });
            topIndex = parseInt(jumpPage_id);
            bottomIndex = parseInt(jumpPage_id);
            RefreshNewMsg(topIndex, 'Top');
            jumpPage_id = '';
            RoomList('close');
          "
        >
          跳转
        </button>
        <input
          class="Input"
          :placeholder="'跳转页数,最大' + maxIndex + '页'"
          @keydown.enter="
            nextTick(() => {
              ClearMsg();
            });
            topIndex = parseInt(jumpPage_id);
            bottomIndex = parseInt(jumpPage_id);
            RefreshNewMsg(topIndex, 'Top');
            jumpPage_id = '';
            RoomList('close');
          "
          v-model="jumpPage_id"
        />
      </div>
      <div v-for="room in room_list" :key="room">
        <div
          class="Item"
          :id="'room-' + room.room_name"
          v-on:click="JumpToRoom(room.room_id)"
        >
          <img class="Icon" src="../assets/chat.png" />{{ room.room_name }}
        </div>
      </div>
    </div>
  </div>

  <!-- 搜索列表 -->
  <div class="VillaCollection" id="SearchPanel" style="top: 100vh; left: 100vw">
    <div class="BackGround" id="SearchPanel_bg" v-on:click="SearchPanel('close')"></div>
    <div
      class="ItemArea"
      id="SearchPanel_items"
      style="width: 100vw; height: 90vh; left: -100vw"
    >
      <div class="SearchPanel">
        <div class="InputArea">
          <input
            class="Input"
            placeholder="搜索的消息（回车确认）"
            @keydown.enter="SearchMsg()"
            v-model="msgToSearch"
          />
        </div>
        <button class="SelectUserButton" v-on:click="SelecUserPanel('open')">
          搜索{{ filteruser.id == "0" ? "所有人" : filteruser.name }}
        </button>
        <div class="DateInputGroup">
          <input type="Date" v-model="jumpDateTime" /><button v-on:click="JumpDateTime()">
            跳转
          </button>
        </div>
        <div class="Line"></div>
        <div class="MsgList">
          <div
            v-for="msg in search_msgCollection"
            :key="msg"
            class="Msg"
            v-on:click="
              SearchPanel('close');
              ViewMsg(msg.msgID, true);
            "
          >
            <img class="avatar" :src="msg.avatar_url" />
            <div class="name">{{ msg.name }}</div>
            <div class="time">{{ Time(msg.time + standTimeEpoch) }}</div>
            <div class="text">{{ msg.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 选择用户列表 -->
  <div class="VillaCollection" id="SelectUserPanel" style="top: 100vh; left: 100vw">
    <div
      class="BackGround"
      id="SelectUserPanel_bg"
      v-on:click="SelecUserPanel('close')"
    ></div>
    <div
      class="ItemArea"
      id="SelectUserPanel_items"
      style="width: 100vw; height: 90vh; left: -100vw"
    >
      <div class="SearchPanel">
        <div class="InputArea">
          <input class="Input" placeholder="搜索的名字" v-model="filteruserName" />
        </div>
        <div class="Line"></div>
        <div
          v-if="isSelectUser"
          class="MsgList"
          style="justify-content: center; align-items: center"
        >
          <div
            v-for="user in user_list"
            :key="user"
            v-on:click="
              SelecUserPanel('close');
              filteruser.id = user.id;
              filteruser.name = user.name;
            "
          >
            <div
              v-if="
                filteruserName == '' ||
                (user.name != undefined && user.name.includes(filteruserName))
              "
              class="Msg"
            >
              <img class="avatar" :src="user.portraitUri" />
              <div
                class="name"
                style="
                  position: relative;
                  padding-top: 0.8rem;
                  padding-bottom: 0.8rem;
                  height: auto;
                "
              >
                {{ user.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import apiDomain from "@/setting";
import { XMLHttpSend, getUrlParam } from "@/util";
import MsgBox from "./MsgBox.vue";

onMounted(() => {
  //获取url中的页数参数
  let index = getUrlParam("page");
  villa_id = getUrlParam("villa_id");
  room_id = getUrlParam("room_id");

  //刷新消息
  XMLHttpSend(
    apiDomain + "/maxPage" + "?villa_id=" + villa_id + "&room_id=" + room_id,
    "GET",
    (response) => {
      if (response.jumpToRoom != undefined) {
        JumpToRoom(response.jumpToRoom);
      }

      maxIndex = response.page;
      initialIndex = maxIndex;
      if (index !== false) {
        initialIndex = parseInt(index);
      }
      topIndex = initialIndex;
      bottomIndex = initialIndex;
      RefreshNewMsg(initialIndex, "Bottom", index === false ? "init" : "");
      if (initialIndex == maxIndex && initialIndex > 0) {
        topIndex--;
        RefreshNewMsg(initialIndex - 1, "Top", index === false ? "init" : "");
      }
    }
  );

  //获取房间消息
  XMLHttpSend(
    apiDomain + "/roomlist?villa_id=" + villa_id + "&room_id=" + room_id,
    "GET",
    (response) => {
      nextTick(() => {
        room_list.value = response.list;
        room_name.value = response.name;
      });
    }
  );

  //获取用户信息
  XMLHttpSend(
    apiDomain + "/searchUserInRoom?" + GetVillaMessageUrl(),
    "GET",
    (response) => {
      user_list.value = response;
    }
  );

  //获取置顶信息
  XMLHttpSend(apiDomain + "/pinMsg?" + GetVillaMessageUrl(), "GET", (response) => {
    response.reverse();
    for (let i = 0; i < response.length; i++) {
      try {
        let index = i;
        XMLHttpSend(
          apiDomain + "/search?id=" + response[index].msgID + "&" + GetVillaMessageUrl(),
          "GET",
          (quote_response) => {
            quoteCollection.value[response[index].msgID] = quote_response;
          }
        );
      } catch {
        console.log("获取置顶消息失败");
      }
    }
    pin_msgCollection.value = response;
  });

  RoomList("close");
  SearchPanel("close");
  CalendarPanel("close");
  SelecUserPanel("close");
  PinMsgPanel("close");
});
</script>

<!-- 消息组件访问公共属性 -->
<script>
import { getEmotionInfo, emoticon_set } from "../emotion.js";

let villa_id;
let room_id;

export const standTimeEpoch = 1596211948000;

//房间列表
const room_list = ref([]);
//房间名称
export const room_name = ref("");
//所有用户列表
const user_list = ref([]);
//所有指定的信息
const pin_msgCollection = ref([]);

let DbyEmotionList = getEmotionInfo.data.type_emoticon_mapping;
let MHYEmotionList = emoticon_set.data.list;

//搜索成功的消息
const search_msgCollection = ref([]);

const jumpPage_id = ref(""); //需要跳转的页数
const msgToSearch = ref(""); //需要搜索的消息
const isRefreshing = ref(true); //是否正在刷新（获取）状态
const filteruserName = ref(""); //搜索的名字

let filteruser = ref({ id: "0", name: "" }); //搜索的用户ID

let maxIndex = 0; //最大页数
let initialIndex = 0; //初始页数
let topIndex = initialIndex; //顶部页数
let bottomIndex = initialIndex; //底部页数
const intervalIndex = 5; //允许的页数差

//引用消息合集
export const quoteCollection = ref({});
//消息合集
export const msgCollection = ref([]);
//活跃标识
export const active_label = ["淼王", "水娃", "焱娃", "火娃"];
//搜索的时间
const jumpDateTime = ref("2023-04-16");

const viewImage = ref(false);
const viewImageUrl = ref("https://www.miyoushe.com/_nuxt/img/miHoYo_Game.2457753.png");
//查看图片
export function ViewImage(url) {
  console.log("查看图片" + url);
  viewImageUrl.value = url;
  viewImage.value = true;
}
//跳转到某条消息
export function ViewMsg(msgID, quote = false) {
  console.log(msgID + " was click");

  //若这一页没有消息，根据引用的消息页数确认如何加载页面
  if (!msgCollection.value.some((q) => q.msgID == msgID)) {
    console.log("本页无这个消息");
    let msgPage = quoteCollection.value[msgID].page;
    if (msgPage == topIndex - 1) {
      RefreshNewMsg(msgPage, "Top", msgID);
    } else {
      //消息超出一页，重新刷新
      ClearMsg();
      topIndex = msgPage;
      bottomIndex = msgPage;
      RefreshNewMsg(msgPage, "Top", msgID);
    }
  }
  //消息在本页面，直接跳转
  else {
    let targetElement = document.getElementById(msgID);
    var scrollTarget = document.getElementById("MessageScrollBox");
    scrollTarget.scrollTop =
      targetElement.offsetTop - 110 + document.getElementById("PinMsgBox").style.height; //70
  }
  //若是跳转引用消息，则高亮背景
  if (quote) {
    var box = document.getElementById(msgID).parentElement.parentElement;
    document.getElementById(msgID + "_text").style.fontSize = "1.0rem";
    box.style.animation = "MsgBox-Select-Ani 1s";
    box.addEventListener("animationend", () => {
      box.style.animation = "";
    });
  }
}
//清除所有消息
export function ClearMsg() {
  msgCollection.value = [];
}

//获取新的消息
function RefreshNewMsg(index, addType, viewMsgID = "") {
  console.log("index:" + index + " bottom:" + bottomIndex + " top:" + topIndex);
  //拉取信息
  XMLHttpSend(
    apiDomain + "/pull?index=" + index + "&villa_id=" + villa_id + "&room_id=" + room_id,
    "GET",
    (response) => {
      //获取失败，返回
      if (response.length == undefined) {
        if (addType == "Bottom") bottomIndex--;
        return;
      }

      let topCollection = [];

      //添加信息
      for (let i = 0; i < response.length; i++) {
        try {
          let index = i;

          //尝试获取quote消息
          if (response[index].msgContent.content != undefined) {
            if (response[index].msgContent.content.quote != undefined) {
              if (
                quoteCollection.value[
                  response[index].msgContent.content.quote.quoted_message_id
                ] == undefined
              ) {
                quoteCollection.value[
                  response[index].msgContent.content.quote.quoted_message_id
                ] = { text: "消息获取中..." };
                XMLHttpSend(
                  apiDomain +
                    "/search?id=" +
                    response[index].msgContent.content.quote.quoted_message_id +
                    "&villa_id=" +
                    villa_id +
                    "&room_id=" +
                    room_id,
                  "GET",
                  (id_response) => {
                    quoteCollection.value[
                      response[index].msgContent.content.quote.quoted_message_id
                    ] = id_response;
                  }
                );
              }
            }
          }

          //活跃标识文字
          if (response[index].msgType == "MHY:SYS:VillaActiveLabelNotify") {
            let members = "";
            for (let i = 0; i < response[index].msgContent.content.members.length; i++) {
              if (i != 0) members += ",";
              members += response[index].msgContent.content.members[i].nickname;
            }
            response[index].msgContent.content.members = members;
          }

          //判断消息添加类型
          if (addType == "Bottom") {
            msgCollection.value.push(response[index]);
          }
          if (addType == "Top") {
            topCollection.push(response[index]);
          }
        } catch {
          console.error("RefreshNewMsg()增添消息失败");
        }
      }

      //判断消息添加类型
      if (addType == "Top") {
        topCollection.reverse(); //倒序
        for (let i = 0; i < topCollection.length; i++) {
          msgCollection.value.unshift(topCollection[i]); //添加到头
        }
        nextTick(() => {
          if (msgCollection.value.length <= 50) return;
          ViewMsg(msgCollection.value[50].msgID);
        });
      }
      if (addType == "Bottom") {
        nextTick(() => {
          var scrollTarget = document.getElementById("MessageScrollBox");
          scrollTarget.scrollTop = scrollTarget.scrollTop + 0;
        });
      }
      isRefreshing.value = false;

      //是否跳转至某条消息
      if (viewMsgID != "") {
        if (viewMsgID == "init")
          viewMsgID = msgCollection.value[msgCollection.value.length - 1].msgID;
        nextTick(() => {
          ViewMsg(viewMsgID, true);
        });
      }

      //转为android chrome写的，重新设定字体大小可减少文字意外换行的概率
      nextTick(() => {
        let s = document.getElementsByClassName("ChatBox");
        for (let i = 0; i < s.length; i++) {
          s[i].style.fontSize = "1rem";
        }
      });
    }
  );
}

//页面滑动事件
function MessageBoxScroll(event) {
  const { scrollTop, clientHeight, scrollHeight } = event.target;
  //如果页面为空，返回
  if (msgCollection.value.length <= 0) return;
  //如果在滑动了，返回
  if (isRefreshing.value) return;
  //如果触底了，尝试拉取信息
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    //如果是最后一页，返回
    if (bottomIndex == maxIndex) return;
    isRefreshing.value = true;
    //调整区间
    if (Math.abs(bottomIndex - topIndex) > intervalIndex) {
      topIndex++;
      //删除最开始的五十个元素
      for (let i = 0; i < 50; i++) {
        msgCollection.value.shift();
      }
    }
    bottomIndex++;
    //刷新新的消息
    RefreshNewMsg(bottomIndex, "Bottom");
    console.log("到达底部");
  }
  //如果触顶了
  if (scrollTop <= 0) {
    if (topIndex == 0) return;
    isRefreshing.value = true;
    if (Math.abs(bottomIndex - topIndex) > intervalIndex) {
      bottomIndex--;
      for (let i = 0; i < 50; i++) {
        msgCollection.value.pop();
      }
    }
    topIndex--;
    RefreshNewMsg(topIndex, "Top");
    console.log("到达顶部");
  }
}

//打开房间切换列表
function RoomList(action) {
  if (action == "open") {
    console.log("open");

    var item = document.getElementById("room-" + room_name.value);
    item.scrollIntoView();
    item.style.backgroundColor = "#00000015";
    document.getElementById("villa_collection_bg").style.left = 0;
    document.getElementById("villa_collection_items").style.left = 0;
  } else {
    console.log("close");
    document.getElementById("villa_collection_bg").style.left = document.getElementById(
      "villa_collection_bg"
    ).style.width;
    document.getElementById(
      "villa_collection_items"
    ).style.left = document.getElementById("villa_collection_items").style.width;
  }
}
function JumpToRoom(room_id_) {
  RoomList("close");
  if (room_id_ == room_id) return;
  window.location.href = "/?villa_id=" + villa_id + "&room_id=" + room_id_;
}

function SearchPanel(action) {
  if (action == "open" && isRefreshing.value == false) {
    document.getElementById("SearchPanel_bg").style.bottom = 0;
    document.getElementById("SearchPanel_items").style.bottom = 0;
  } else {
    document.getElementById("SearchPanel_bg").style.bottom = "-100vh";
    document.getElementById("SearchPanel_items").style.bottom = "-100vh";
  }
}

const isSelectUser = ref(false);
function SelecUserPanel(action) {
  if (action == "open") {
    isSelectUser.value = true;
    document.getElementById("SelectUserPanel_bg").style.bottom = 0;
    document.getElementById("SelectUserPanel_items").style.bottom = 0;
  } else {
    isSelectUser.value = false;
    document.getElementById("SelectUserPanel_bg").style.bottom = "-100vh";
    document.getElementById("SelectUserPanel_items").style.bottom = "-100vh";
  }
}
function CalendarPanel(action) {
  console.log(action);
}
function PinMsgPanel(action) {
  if (action == "open") {
    document.getElementById("PinMsg_bg").style.left = document.getElementById(
      "PinMsg_bg"
    ).style.width;
    document.getElementById("PinMsg_items").style.left =
      "-" + document.getElementById("PinMsg_items").style.width;
  } else {
    console.log("close");
    document.getElementById("PinMsg_bg").style.left = 0;
    document.getElementById("PinMsg_items").style.left = 0;
  }
}

//搜索特定消息
function SearchMsg() {
  console.log("search");

  isRefreshing.value = true;
  XMLHttpSend(
    apiDomain +
      "/searchSpecialContentMsg?" +
      GetVillaMessageUrl() +
      "&id=" +
      filteruser.value.id +
      "&msg=" +
      encodeURIComponent(msgToSearch.value),
    "GET",
    (response) => {
      response.reverse();
      search_msgCollection.value = response;

      for (let i in response) {
        if (quoteCollection.value[response[i].msgID] == undefined) {
          quoteCollection.value[response[i].msgID] = response[i];
        }
      }
      isRefreshing.value = false;
    }
  );
}

//返回yyyy-MM-dd时间
export function Time(time = +new Date()) {
  var date = new Date(time + 8 * 3600 * 1000);
  return date.toJSON().substring(0, 19).replace("T", " ");
}

//返回房间url信息
function GetVillaMessageUrl() {
  return "villa_id=" + villa_id + "&room_id=" + room_id;
}

//转义表情文字
export let reg = /\[.+?\]/g;
export function replaceDbyEmotion(match) {
  let res = match;
  let keys = Object.keys(DbyEmotionList);
  keys.forEach((key) => {
    if ("[" + DbyEmotionList[key].describe_text + "]" == match) {
      res = `<img src="${DbyEmotionList[key].icon}" style="width: 1.25em;vertical-align:middle;" alt="图片">`;
      return;
    }
  });
  return res;
}
//米游社表情
export function MHYEmotion(match) {
  let res = match;
  MHYEmotionList.forEach((Type) => {
    Type.list.forEach((item) => {
      if (item.name == match) {
        res = `<img src="${item.icon}" style="width: 5rem;vertical-align:middle;" alt="图片">`;
        return;
      }
    });
    if (res != match) return;
  });
  return res;
}

//跳转特定日期
function JumpDateTime() {
  if (jumpDateTime.value != "0") {
    SearchPanel("close");
    isRefreshing.value = true;
    XMLHttpSend(
      apiDomain +
        "/jumpDateTime" +
        "?" +
        GetVillaMessageUrl() +
        "&d=" +
        jumpDateTime.value,
      "GET",
      (response) => {
        if (quoteCollection.value[response.msgID] == undefined)
          quoteCollection.value[response.msgID] = response;
        ViewMsg(response.msgID);
        isRefreshing.value = false;
      }
    );
  }
}

//@高亮
export function TextHightLight(msgContent) {
  let feature = [];
  if (msgContent.content.entities == undefined) return msgContent;
  for (let i = 0; i < msgContent.content.entities.length; i++) {
    try {
      let substring = msgContent.content.text.substring(
        msgContent.content.entities[i].offset,
        msgContent.content.entities[i].length
      );
      if (!substring.startsWith("@")) continue;
      feature.push(substring);
    } catch {
      console.error(`增添高亮信息失败${msgContent.content.entities[i]}`);
    }
  }
  feature.forEach((item) => {
    console.log(item);
    msgContent.content.text = msgContent.content.text.replace(
      item,
      `<span style="color:#00B1F7">${item}</span>`
    );
  });
  return msgContent;
}
</script>

<!-- 
MHY:SYS:VillaRoomCreated [x]
MHY:SYS:PinMessage [x]
MHY:SYS:VillaActiveLabelNotify [x] 
MHY:SYS:BannedToSendMessage [x]
MHY:SYS:RoomLiveStateUpdated [x]

MHY:Text [.x] Quote[x] Badge[ ] Image[ ]
MHY:Image [.]//无缩放功能
MHY:HoYomoji [x]
MHY:Emoticon [.]
MHY:CustomEmoticon [x]
MHY:AvatarEmoticon [x]
MHY:RandomEmoticon [x]
MHY:ShareVillaPost [.]
MHY:VillaCard [.]
MHY:Post [x]
MHY:MessageSpotlightCollection [x]
MHY:RobotCard [x]
MHY:ForwardMsg [x]

RC:RcCmd [ ]
-->
