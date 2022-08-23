export interface GenerateConfig {
	pages: string
	importPrefix?: string
	dynamicImport?: boolean
	chunkNamePrefix?: string
	nested?: boolean
}

export interface PluginConfig extends GenerateConfig{
	useModule?: boolean
	output?: string
}
