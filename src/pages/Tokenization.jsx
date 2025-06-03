import styled from 'styled-components';

const FormContainer = styled.div`
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
`;
const Input = styled.input`
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`;
const Select = styled.select`
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`;
const MintButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;
function Tokenization() {
  const handleMint = () => {
	alert('Token minted! (Placeholder)');
	// Add smart contract interaction here later
  };
  return (
	<FormContainer>
	  <h2>Tokenization Form</h2>
	  <Input placeholder="Produce Name" />
	  <Input placeholder="Description" />
	  <Input placeholder="Harvest Date" type="date" />
	  <Select>
		<option>Location</option>
		<option>Farm A</option>
		<option>Farm B</option>
	  </Select>
	  <Input placeholder="Quantity" type="number" />
	  <MintButton onClick={handleMint}>Mint Token</MintButton>
	</FormContainer>
  );
}

export default Tokenization;