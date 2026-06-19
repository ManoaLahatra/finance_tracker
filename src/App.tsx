import React from 'react';
import { Helmet } from 'react-helmet-async'

function App(props: React.PropsWithChildren) {

	return (
		<>
			<Helmet>
				<title>ViteSSR + React + Helmet</title>
			</Helmet>
			{props.children}
		</>
	)
}

export default App
