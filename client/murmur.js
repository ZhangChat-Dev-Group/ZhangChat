//import './auth.js'

export async function getMurmur() {
	return await Fingerprint2.getPromise({}).then(components => {
		// 参数
		const values = components.map(function (component) {
			return component.value
		});
		// 指纹
		return Fingerprint2.x64hash128(values[19].join(''), 31);
	})
}