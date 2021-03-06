import { RPCSubprovider } from '../subProviders/RPCSubprovider';
import { encodeERC20AssetData } from '../../utils/AssetDataUtils';
import { NULL_ADDRESS, DECIMALS, GANACHE_NETWORK_ID, RPC_URL } from '../Constants';
import { ZERO } from '../../utils/math/CowriMath';
import { generateRandom256Salt, getFutureExpiration} from '../../utils/utils';
import { Web3ProviderEngine } from '../providerEngine/Web3ProviderEngine';
import { ZeroExERC20ContractWrapper } from '../contractWrappers/ZeroExERC20ContractWrapper';
import { ZeroExContractAddresses } from '../contractAddresses/ZeroExContractAddresses';
import { Web3Provider } from '../providers/Web3Provider';
import { getOrderHashHex } from '../../utils/OrderHashUtils';
import { ecSignHashAsync } from '../../utils/SignatureUtils';

it ('Test the end-to-end process of making a transaction', async () => {

  const providerEngine = new Web3ProviderEngine();
  providerEngine.addProvider(new RPCSubprovider(RPC_URL).getSubprovider());
  providerEngine.start();
  const contractWrappers = new ZeroExERC20ContractWrapper(providerEngine.getEngine(), { networkId: GANACHE_NETWORK_ID });

  const web3Wrapper = new Web3Provider(providerEngine.getEngine());
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();

  const zeroExContractAddresses = new ZeroExContractAddresses();
  const contractAddresses = zeroExContractAddresses.getContractAddressesForNetworkOrThrow(GANACHE_NETWORK_ID);
  const zrxTokenAddress = contractAddresses.zrxToken;
  const etherTokenAddress = contractAddresses.etherToken;

  const makerAssetData = encodeERC20AssetData(zrxTokenAddress);
  const takerAssetData = encodeERC20AssetData(etherTokenAddress);

  // the amount the maker is selling of maker asset
  const makerAssetAmount = web3Wrapper.toBaseUnitAmount(5, DECIMALS);
  // the amount the maker wants of taker asset
  const takerAssetAmount = web3Wrapper.toBaseUnitAmount(0.1, DECIMALS);
  const makerZRXApprovalTxHash = await contractWrappers.setUnlimitedProxyAllowanceAsync(
        zrxTokenAddress,
        maker
  );

  await web3Wrapper.awaitTransactionSuccessAsync(makerZRXApprovalTxHash);
  const takerWETHApprovalTxHash = await contractWrappers.setUnlimitedProxyAllowanceAsync(
        etherTokenAddress,
        taker
  );

  await web3Wrapper.awaitTransactionSuccessAsync(takerWETHApprovalTxHash);

  const takerWETHDepositTxHash = await contractWrappers.depositEtherAsync(
        etherTokenAddress,
        takerAssetAmount,
        taker
  );

  await web3Wrapper.awaitTransactionSuccessAsync(takerWETHDepositTxHash);

  const randomExpiration = getFutureExpiration();
  const exchangeAddress = contractAddresses.exchange;

  const order = {
        exchangeAddress,
        makerAddress: maker,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generateRandom256Salt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFee: ZERO,
        takerFee: ZERO,
  };

  const orderHashHex = getOrderHashHex(order);

  const signature = await ecSignHashAsync(providerEngine.getEngine(), orderHashHex, maker);
  const signedOrder = { ...order, signature  };

  await contractWrappers.validateFillOrderThrowIfInvalidAsync(signedOrder, takerAssetAmount, taker);
  console.log('Did it freaking finish? Jeez');
});

