import wallet from "../../../Turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,
    findMetadataPda
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";

// Define our Mint address
const mint = publicKey("2AmbUamnbdhEnbStHZNpp7GqSwn1nW9wjSEV6RAJCEsU")
const METADATA_PROGRAM_ID = publicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

// Derive the Metadata PDA using the mint address and metadata program ID
const metadataPDA = findMetadataPda({
    mint: mint,
    programId: METADATA_PROGRAM_ID,
});

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            metadata: keypair.publicKey,
            mint: mint,
            mintAuthority: signer,
            payer: signer,
            updateAuthority: signer.publicKey

        }

        let data: DataV2Args = {
            name: "CollectiFi",
            symbol: "CiFi",
            uri: "ts/cluster1/spl_metadata.json",
            sellerFeeBasisPoints: 500,
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data: data,
            isMutable: true,
            collectionDetails: null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log(bs58.encode(result.signature));
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
