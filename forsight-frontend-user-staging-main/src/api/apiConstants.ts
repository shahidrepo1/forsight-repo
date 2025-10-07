import axios from "axios";

export const baseServiceUrl = import.meta.env.VITE_BASE_SERVICE_URL as string;
export const baseServiceApiUrl = `${baseServiceUrl}api/`;

export const reportingServiceUrl = import.meta.env
  .VITE_REPORTING_SERVICE_URL as string;
export const reportingServiceApiUrl = `${reportingServiceUrl}generatePdfReport/`;

// auth
export const loginUrl = `${baseServiceApiUrl}user/login/`;
export const logoutUrl = `${baseServiceApiUrl}user/logout/`;
export const refreshUrl = `${baseServiceApiUrl}user/refresh/`;

// profiles configurator data
export const addNewProfileUrl = `${baseServiceApiUrl}configurator/addNewProfile/`;
export const deleteProfileUrl = `${baseServiceApiUrl}configurator/deleteProfile/`;
export const getProfilesUrl = `${baseServiceApiUrl}configurator/getConfiguredProfiles/`;
export const getPlayList = `${baseServiceApiUrl}playlist/`;
export const createPlayList = `${baseServiceApiUrl}playlist/create/`;
export const updatePlayList = `${baseServiceApiUrl}playlist/update/`;
export const deletePlayListUrl = `${baseServiceApiUrl}playlist/delete/`;

// keywords configurator data
export const getKeywordsUrl = `${baseServiceApiUrl}configurator/getConfiguredKeywords/`;
export const addNewKeywordUrl = `${baseServiceApiUrl}configurator/addNewKeyword/`;
export const deleteKeywordUrl = `${baseServiceApiUrl}configurator/deleteKeyword/`;
export const suspendKeywordUrl = `${baseServiceApiUrl}configurator/suspendKeyword/`;

// data
export const profilesDataUrl = `${baseServiceApiUrl}configurator/getConfiguredProfilesData/`;
export const keywordsDataUrl = `${baseServiceApiUrl}configurator/getConfiguredKeywordsData/`;
export const deleteFilesUrl = `${baseServiceApiUrl}configurator/deleteData/`;
export const updateSentimentUrl = `${baseServiceApiUrl}configurator/updateSentiment/`;
export const xDetailUrl = `${baseServiceApiUrl}configurator/data/x/`;
export const youtubeDetailUrl = `${baseServiceApiUrl}configurator/data/youtube/`;
export const webDetailUrl = `${baseServiceApiUrl}configurator/data/web/`;

// charts
export const sentimentDonutChartDataUrl = `${baseServiceApiUrl}visualizations/donut/`;
export const wordcloudChartDataUrl = `${baseServiceApiUrl}visualizations/generateWordCloud/`;
export const sentimentBarChartDataUrl = `${baseServiceApiUrl}visualizations/barchart/`;
export const dataDistributionChartDataUrl = `${baseServiceApiUrl}visualizations/piechart/`;
export const dataCountUrl = `${baseServiceApiUrl}visualizations/totalRecords/`;
export const logsDonutChartUrl = `${baseServiceApiUrl}visualizations/logcharts/`;
export const platformWiseLogsChartChartUrl = `${baseServiceApiUrl}visualizations/crawllog-status-chart/`;

// news gpt

export const gptPdfReportUrl = `${baseServiceApiUrl}reports/getConfiguredNewsGPTReportData/`;

// crawlers Logs

export const getLogsListUrl = `${baseServiceApiUrl}configurator/crawl-logs/`;
export const getSchedularLogsListUrl = `${baseServiceApiUrl}configurator/schedular_logs/`;

export const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
