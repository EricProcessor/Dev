let config = {}
config.httpApi = process.env.NODE_ENV=='development'
				? '/m'   //本地调试环境
				: ''
export default config	