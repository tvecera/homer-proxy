<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle && !printer">
          {{ item.subtitle }}
        </template>

        <template
            v-if="!error && display === 'text' && ['printing', 'paused', 'finished', 'stopped'].includes(statusClass)"
        >
          <i class="fa-solid fa-gear mr-1"></i>
          <b v-if="job && job.completion">{{ job.completion.toFixed() }}%</b>
          <span class="separator mx-1"> | </span>
          <span v-if="job &&  job.timePrinting" :title="`${formatTime(job.timePrinting)} left`">
            <i class="fa-solid fa-stopwatch mr-1"></i>
            {{ formatTime(job.timePrinting) }}
          </span>
          <span class="separator mx-1"> | </span>
          <span v-if="job &&  job.timeRemaining" :title="`${formatTime(job.timeRemaining)} left`">
            <i class="fa-solid fa-stopwatch mr-1"></i>
            {{ formatTime(job.timeRemaining) }}
          </span>
        </template>

        <template v-if="!error && display === 'text' && ['idle', 'busy', 'ready', 'atttention'].includes(statusClass)">
          <i class="fa-solid fa-temperature-half mr-1"></i>
          <span class="mx-1">Bed: </span>
          <b v-if="printer && printer.temp_bed">{{ printer.temp_bed }} &#176;C</b>
          <span class="separator mx-1"> | </span>
          <i class="fa-solid fa-temperature-half mr-1"></i>
          <span class="mx-1">Nozzle: </span>
          <b v-if="printer && printer.temp_nozzle">{{ printer.temp_nozzle }} &#176;C</b>
        </template>

        <template v-if="statusClass = 'error' && printer && !printer.status_printer.ok">
          <i class="fa-solid fa-power-off mr-1"></i>
          <b v-if="printer.status_printer.message">{{printer.status_printer.message}}</b>
        </template>

        <template v-if="!error && display === 'bar'">
          <progress
              v-if="job &&  job.completion"
              class="progress is-primary"
              :value="job.completion"
              max="100"
              :title="`${printer.state} - ${job.completion.toFixed()}%, ${formatTime(
              job.timeRemaining,
            )} left`"
          >
            {{ job.completion }}%
          </progress>
        </template>
        <span v-if="error" :title="error">{{ error }}</span>
      </p>
    </template>
    <template #indicator>
      <div :class="['status', statusClass]" :title="`${printer ? printer.status : 'Error'}`">{{ statusClass }}</div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";
import {info} from "sass";

export default {
  name: "PrusaLink",
  mixins: [service],
  props: {
    item: Object,
  },
  components: {
    Generic,
  },
  data: () => ({
    display: 'text',
    job: {
      timePrinting: null,
      timeRemaining: null,
      completion: null,
      state: null,
    },
    printer: null,
    error: null,
  }),
  computed: {
    statusClass: function () {
      return this.printer && this.printer.state ? this.printer.state.toLowerCase() : 'error'
    },
  },
  created() {
    this.display = this.item.display === 'bar' ? 'bar' : "text";
    this.fetchPrinterStatus();
    this.fetchJobStatus();
  },
  methods: {
    fetchPrinterStatus: async function () {
      try {
        const response = await this.fetch(`api/v1/status`, {headers: {'X-Api-Key': `${this.item.apikey}`}}, true);
        this.printer = response.printer;
        this.error = response.error;
      } catch (e) {
        this.error = `Fail to fetch PrusaLink status data`;
        console.error(e);
      }
    },
    fetchJobStatus: async function () {
      try {
        const response = await this.fetch(`api/v1/job`, {headers: {'X-Api-Key': `${this.item.apikey}`}}, true);
        this.job.timePrinting = response.time_printing || 0;
        this.job.timeRemaining = response.time_remaining || 0;
        this.job.timeRemaining -= 60;
        this.job.completion = response.progress || 0;
        this.job.state = response.state || 'ERROR';
        this.error = response.error;
      } catch (e) {
        this.error = `Fail to fetch PrusaLink job data`;
        console.error(e);
      }
    },
    formatTime: function (seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return [hours, minutes].map(val => val.toString().padStart(2, '0')).join(':');
    },
  },
};
</script>

<style scoped lang="scss">
.fa-triangle-exclamation::before {
  color: #d65c68;
}

.progress {
  height: 8px;
  width: 90%;
}

.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.offline:before, &.error:before {
    background-color: #d65c68;
    box-shadow: 0 0 5px 1px #d65c68;
    color: #d65c68;
  }

  &.paused:before, &.atttention:before, &.stopped:before {
    background-color: #e8bb7d;
    box-shadow: 0 0 5px 1px #e8bb7d;
  }

  &.pending:before, &.busy:before {
    background-color: #e8bb7d;
    box-shadow: 0 0 5px 1px #e8bb7d;
    animation: pulse 1s alternate infinite;
  }

  &.online:before, &.ready:before, &.idle:before, &.finished:before {
    background-color: #94e185;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.in-progress:before, &.printing:before {
    background-color: #94e185;
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
    width: 8px;
    height: 8px;
    margin-right: 10px;
    border-radius: 8px;
  }
}
</style>
