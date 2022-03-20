import React, { useContext } from "react";
import { Form, Button, Card } from 'react-bootstrap';
import { TransactionContext } from '../context/TransactionsContext';
import { Loader } from "./";
const FormPage = () => {
  const { handleTransfer, handleChange, confirmedText, isLoading } = useContext(TransactionContext);
  return (
    <Card className="mx-auto" style={{ width: '24rem'}}>
      <Card.Title>Transfer</Card.Title>
      <Card.Text>Transfer your Token here</Card.Text>
    <Form>
      <Form.Group className="mb-3" controlId="addressTo">
        <Form.Label>Address To</Form.Label>
        <Form.Control placeholder="Recipient Address" onChange={(e) => {handleChange(e, "addressTo")}}/>
        
      </Form.Group>

      <Form.Group className="mb-3" controlId="amount">
        <Form.Label>Token Amount</Form.Label>
        <Form.Control placeholder="Amount" onChange={(e) => {handleChange(e, "amount")}}/>
        <Form.Text className="text-muted">
          Make sure you have IYO Token.
        </Form.Text>
      </Form.Group>
      <Button variant="primary" onClick={(e) => handleTransfer(e)}>
        Transfer
      </Button>
      {isLoading? <div><Loader style={{marginTop: '1rem'}}></Loader></div>: <></>}
      <div className="mb-3">{confirmedText}</div>
    </Form>
    </Card>
  );
};

export default FormPage;