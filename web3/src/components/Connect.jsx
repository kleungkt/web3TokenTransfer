import { Button } from "react-bootstrap";
import { useContext } from "react";
import { TransactionContext } from "../context/TransactionsContext";
const Connect = () => {
  const { currentAccount, connectWallet } = useContext(TransactionContext);
  return (
    <>
      {currentAccount ?
        <div className="connect">
        <div>Wallet connected!</div>
        <div>Address: {currentAccount}</div> </div>
        :
        <Button className="connect" onClick={connectWallet}>
          Connect Wallet
        </Button>}
    </>
  )
}
export default Connect;