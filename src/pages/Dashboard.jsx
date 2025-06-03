import styled from 'styled-components';
import ConnectWallet from '../components/ConnectWallet';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled.div`
  padding: 20px;
  text-align: center;
`;
const RoleButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;
function Dashboard() {
  const navigate = useNavigate();
  return (
	<DashboardContainer>
	  <h2>Connect Wallet</h2>
	  <ConnectWallet />
	  <h3>Choose your role:</h3>
	  <RoleButton onClick={() => navigate('/tokenization')}>
		Farmer
	  </RoleButton>
	  <RoleButton onClick={() => navigate('/transfer-ownership')}>
		Distributor
	  </RoleButton>
	  <RoleButton onClick={() => navigate('/transfer-ownership')}>
		Retailer
	  </RoleButton>
	  <RoleButton onClick={() => navigate('/supply-chain-explorer')}>
		Consumer
	  </RoleButton>
	</DashboardContainer>
  );
}
export default Dashboard;