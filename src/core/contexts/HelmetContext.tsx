import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import helmetContext from './helmetContext';

const HelmetProvider = (props: React.PropsWithChildren) => {
    const [title, setTitle] = useState('Hello');
    const [meta, setMeta] = useState<React.MetaHTMLAttributes<HTMLMetaElement>[]>([]);
    const [link, setLink] = useState<React.LinkHTMLAttributes<HTMLLinkElement>[]>([]);
    const [script, setScript] = useState<React.ScriptHTMLAttributes<HTMLScriptElement>[]>([]);
    const [style, setStyle] = useState<string[]>([]);

    return (
        <helmetContext.Provider
            value={{ title, setTitle, meta, setMeta, link, setLink, script, setScript, style, setStyle }}>
            <Helmet>
                {title && <title>{title}</title>}
                {meta.map((m, i) => <meta key={i} {...m} />)}
                {link.map((l, i) => <link key={i} {...l} />)}
                {script.map((s, i) => <script key={i} {...s} />)}
                {style.map((s, i) => <style key={i}>{s}</style>)}
            </Helmet>

            {props.children}
        </helmetContext.Provider>
    );
};

export default HelmetProvider;
