<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="!error">
          <span class="mx-1">Clients: </span>
          <b v-if="num_sta">{{ num_sta }}</b>
          <span class="separator mx-1"> | </span>
          <i class="fa-solid fa-arrow-down-long mr-1 ml-1"></i>
          <b v-if="rx_bytes_r">{{ convertBytesPerSecondToMbps(rx_bytes_r).toFixed(2) }} Mbps</b>
          <i class="fa-solid fa-arrow-up-long mr-1 ml-1"></i>
          <b v-if="tx_bytes_r">{{ convertBytesPerSecondToMbps(tx_bytes_r).toFixed(2) }} Mbps</b>
        </template>
        <span v-if="error" :title="error">{{ error }}</span>
      </p>
    </template>
    <template #indicator>
      <div v-if="!error" class="status online">online</div>
      <div v-if="error" class="status offline">offline</div>
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
      num_sta: null,
      tx_bytes_r: null,
      rx_bytes_r: null,
      error: null,
    };
  },
  created: function () {
    this.fetchStatus();
  },
  methods: {
    fetchStatus: function () {

      this.fetch(`/sites/${this.item.index}`)
          .then((result) => {
            if (result && result.health) {
              const wan = result.health.find(item => item.subsystem === 'wan');
              if (wan) {
                this.num_sta = wan.num_sta;
                this.tx_bytes_r = wan['tx_bytes-r']
                this.rx_bytes_r = wan['rx_bytes-r']
              } else {
                this.error = 'No data'
              }
            } else {
              this.error = 'No data'
            }
          })
          .catch((e) => {
            this.error = `Fail to fetch UniFi status data`;
            console.error(e);
          });
    },
    convertBytesPerSecondToMbps: function (bytesPerSecond) {
      const BITS_PER_BYTE = 8;
      const BYTES_PER_MEGABIT = 125000; // 1,000,000 bits / 8 bits per byte

      return (bytesPerSecond * BITS_PER_BYTE) / BYTES_PER_MEGABIT;
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
