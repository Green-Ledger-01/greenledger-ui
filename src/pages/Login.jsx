import styled from 'styled-components';
import ConnectWallet from '../components/ConnectWallet';
import { useNavigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

const Container = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
`;

const Title = styled.h1`
  font-size: 28px;
  margin: 20px 0;
`;

const LearnMoreButton = styled.button`
  padding: 10px 20px;
  margin-left: 10px;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
`;

function Login() {
  const navigate = useNavigate();
  const { active } = useWeb3React();

  const handleLogin = () => {
	if (active) {
	  navigate('/dashboard');
	} else {
	  alert('Please connect your wallet first!');
	}
  };

  return (
	<Container>
	  <img src="/leaf-icon.png" alt="GreenLedger Logo" width="100" />
	  <Title>Bringing Trust to Agriculture with Blockchain</Title>
	  <p>Learn more about us.</p>
	  <ConnectWallet />
    <LearnMoreButton onClick={() => alert('Learn more clicked!')}>
    Learn More
    </LearnMoreButton>
    <button onClick={handleLogin} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
    Login
    </button>
	</Container>
  );
}

export default Login;