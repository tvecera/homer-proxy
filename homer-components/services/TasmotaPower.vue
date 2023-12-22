<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="!error">
          <span class="mx-1">Actual: </span>
          <i class="fa-solid fa-bolt mr-1 ml-1"></i>
          <b v-if="power">{{ power }} W</b>
          <span class="separator mx-1"> | </span>
          <span class="mx-1">Total: </span>
          <i class="fa-solid fa-bolt mr-1 ml-1"></i>
          <b v-if="total">{{ total.toFixed(0) }} kWh</b>
        </template>
        <span v-if="error" :title="error">{{ error }}</span>
      </p>
    </template>
    <template #indicator>
      <div v-if="!error && powerOn" class="status online">on</div>
      <div v-if="error || !powerOn" class="status offline">off</div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
  name: "TasmotaPower",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => {
    return {
      powerOn: false,
      total: null,
      power: null,
      error: null,
    };
  },
  created: function () {
    this.fetchStatus();
    this.fetchPowerStatus();
  },
  methods: {
    fetchStatus: async function () {
      try {
        const base64Credentials = btoa(this.item.username + ':' + this.item.password);
        const options = {};
        options.headers = {};
        options.headers['Authorization'] = 'Basic ' + base64Credentials;
        const response = await this.fetch(`/cm?cmnd=STATUS`, options, true);
        if (response['Status'] && response['Status']['Power']) {
          this.powerOn = response['Status']['Power'];
        }
        this.error = response.error;
      } catch (e) {
        this.error = `Fail to fetch Tasmota Power Socket data`;
        console.error(e);
      }
    },
    fetchPowerStatus: async function () {
      try {
        const base64Credentials = btoa(this.item.username + ':' + this.item.password);
        const options = {};
        options.headers = {};
        options.headers['Authorization'] = 'Basic ' + base64Credentials;
        const response = await this.fetch(`/cm?cmnd=STATUS+8`, options, true);
        if (response['StatusSNS'] && response['StatusSNS']['ENERGY']) {
          const data = response['StatusSNS']['ENERGY'];
          this.total = data['Total'];
          this.power = data['Power'];
        }
        this.error = response.error;
      } catch (e) {
        this.error = `Fail to fetch Tasmota Power Socket data`;
        console.error(e);
      }
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
