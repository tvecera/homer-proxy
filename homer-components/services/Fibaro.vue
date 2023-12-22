<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="!serverError">
          <span class="mx-1">Update available: </span>
          <b>{{ updateStableAvailable ? 'Yes' : 'No' }}</b>
          <span class="separator mx-1"> | </span>
          <span class="mx-1">Connected: </span>
          <b>{{ hasFIDConnected ? 'Yes' : 'No' }}</b>
        </template>
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong class="notif running" title="Connected">
          {{ connected }}
        </strong>
        <strong class="notif errors" title="Disconnected">
          {{ disconnected }}
        </strong>
        <strong
            v-if="serverError"
            class="notif errors"
            title="Connection error to WUD API, check url in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "Fibaro",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      connected: null,
      disconnected: null,
      updateStableAvailable: false,
      hasFIDConnected: false,
      serverError: false,
    };
  },
  created: function () {
    this.fetchStatus();
    this.fetchUpdateStatus();
  },
  methods: {
    fetchStatus: function () {
      const base64Credentials = btoa(this.item.username + ':' + this.item.password);
      const options = {};
      options.headers = {};
      options.headers['Authorization'] = 'Basic ' + base64Credentials;
      this.fetch(`/api/devices`, options)
          .then((devices) => {
            this.connected = 0;
            this.disconnected = 0;
            for (let i = 0; i < devices.length; i++) {
              if (devices[i].properties['dead']) {
                this.disconnected++;
              } else {
                this.connected++;
              }
            }
          })
          .catch(() => {
            this.serverError = true;
          });
    },
    fetchUpdateStatus: function () {
      const base64Credentials = btoa(this.item.username + ':' + this.item.password);
      const options = {};
      options.headers = {};
      options.headers['Authorization'] = 'Basic ' + base64Credentials;
      this.fetch(`/api/settings/info`, options)
          .then((info) => {
            this.updateStableAvailable = info.updateStableAvailable
            this.hasFIDConnected = info.hasFIDConnected
          })
          .catch(() => {
            this.serverError = true;
          });
    },
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;

  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.running {
      background-color: #4fd671;
    }

    &.warnings {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
