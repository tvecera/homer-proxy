<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="!error">
          <i v-if="isPlaying" class="fa-solid fa-play mr-1"></i>
          <i v-if="!isPlaying" class="fa-solid fa-stop mr-1"></i>
          <b>{{ label }}</b>
        </template>
        <span v-if="error" :title="error">{{ error }}</span>
      </p>
    </template>
    <template #indicator>
      <div v-if="error" class="status offline">offline</div>
      <div v-if="!error" :class="`status online${isPlaying ? '-play' : ''}`">online</div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Osmc",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      isPlaying: false,
      label: null,
      error: null,
    };
  },
  created: function () {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: function () {
      const base64Credentials = btoa(this.item.username + ':' + this.item.password);
      const options = {};
      const body =
          [
            {
              jsonrpc: "2.0",
              method: "Player.GetItem",
              params: [1,
                ["title", "thumbnail", "file", "artist", "genre", "year", "rating", "album", "track", "duration",
                  "playcount", "dateadded", "episode", "artistid", "albumid", "tvshowid", "fanart"
                ]
              ],
              id: 62
            }
          ]
      options.headers = {};
      options.headers['Authorization'] = 'Basic ' + base64Credentials;
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
      options.method = 'POST'

      this.fetch(`/jsonrpc?Base`, options)
          .then((result) => {
            if (result && result[0] && result[0].result.item.label.length > 0) {
              this.isPlaying = true
              this.label = result[0].result.item.label
            } else {
              this.isPlaying = false
              this.label = 'Idle'
            }
          })
          .catch((e) => {
            this.error = `Fail to fetch OSMC status data`;
            console.error(e);
          });
    },
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);
  white-space: nowrap;
  margin-left: 0.25rem;

  &.online:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.offline:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
  }

  &.online-play:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
    animation: pulse 1s alternate infinite;
  }

  @keyframes pulse {
    0% {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: inset 0px 0px 10px 2px rgba(0, 255, 182, 0.3),
      0px 0px 5px 2px rgba(0, 255, 135, 0.2);
    }
    100% {
      background: rgba(255, 255, 255, 1);
      box-shadow: inset 0px 0px 10px 2px rgba(0, 255, 182, 0.5),
      0px 0px 15px 2px rgba(0, 255, 135, 1);
    }
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
