import './App.css';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { requestWithAuth } from './request';

Amplify.configure({
    Auth: {
        region: 'ap-northeast-1',
        userPoolId: 'ap-northeast-1_gSLUMHvst',
        userPoolWebClientId: 'your-client-id',
        identityPoolId: 'your-identity-pool-id',
    },
});

async function fetchData() {
    const response = await requestWithAuth();
    const data = await response.text();
    alert(`message: ${data}`);
}

async function fetchWithoutAuth() {
    const response = await fetch(
        'https://your-lambda.lambda-url.ap-northeast-1.on.aws/name/Kanahiro',
    );
    const data = await response.text();
    alert(`message: ${data}`);
}

function App() {
    return (
        <div>
            <button
                onClick={() => {
                    fetchWithoutAuth();
                }}
            >
                Fetch without Auth
            </button>
            <Authenticator initialState="signIn" loginMechanisms={['email']}>
                {({ signOut, user }) => (
                    <main>
                        <button
                            onClick={() => {
                                fetchData();
                            }}
                        >
                            Fetch with Auth
                        </button>
                        Hello, {user!.username}
                        <button onClick={signOut}>Sign out</button>
                    </main>
                )}
            </Authenticator>
        </div>
    );
}

export default App;
