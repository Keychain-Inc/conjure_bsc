import ABI from "../constants/abi/conjure_factory.json";
import useContract from "./useContract";
import {CONJURE_FACTORY_ADDRESS} from "../constants";

export default function useConjureFactoryContract() {
    return useContract(CONJURE_FACTORY_ADDRESS,ABI)
}
