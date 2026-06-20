import React, { useEffect } from 'react';
import useHelmet from '@hooks/useHelmet';
import { FinanceDashboard } from '../../features/finance/FinanceDashboard';

const Home: React.FC = () => {
    const helmet = useHelmet()

    useEffect(() => {
        helmet.setTitle('Finance Tracker')
    }, [helmet])

    return <FinanceDashboard />
}

export default Home;
