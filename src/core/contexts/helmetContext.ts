import React from 'react';

export type HelmetContextValue = {
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    meta: React.MetaHTMLAttributes<HTMLMetaElement>[];
    setMeta: React.Dispatch<React.SetStateAction<React.MetaHTMLAttributes<HTMLMetaElement>[]>>;
    link: React.LinkHTMLAttributes<HTMLLinkElement>[];
    setLink: React.Dispatch<React.SetStateAction<React.LinkHTMLAttributes<HTMLLinkElement>[]>>;
    script: React.ScriptHTMLAttributes<HTMLScriptElement>[];
    setScript: React.Dispatch<React.SetStateAction<React.ScriptHTMLAttributes<HTMLScriptElement>[]>>;
    style: string[];
    setStyle: React.Dispatch<React.SetStateAction<string[]>>;
};

const emptySetter = () => undefined;

const helmetContext = React.createContext<HelmetContextValue>({
    title: 'Hello',
    setTitle: emptySetter,
    meta: [],
    setMeta: emptySetter,
    link: [],
    setLink: emptySetter,
    script: [],
    setScript: emptySetter,
    style: [],
    setStyle: emptySetter,
});

export default helmetContext;
