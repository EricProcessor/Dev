let config = {}
config.httpApi = process.env.NODE_ENV=='development'
				? 'http://m-new-dev.tlwok.com/'   //本地调试环境
				: 'http://m-new-dev.tlwok.com/'
export default config	