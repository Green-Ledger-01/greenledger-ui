
"use client";

// Particle imports
import { mainnet, polygon } from "@particle-network/authkit/chains"; // Chains are imported here
import { AuthType } from "@particle-network/auth-core";
import {
  AuthCoreContextProvider,
  PromptSettingType,
} from "@particle-network/authkit"; 

export const ParticleAuthkit = ({ children }: React.PropsWithChildren) => {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: import.meta.env.VITE_PARTICLE_PROJECT_ID!,
        clientKey: import.meta.env.VITE_PARTICLE_CLIENT_KEY!,
        appId: import.meta.env.VITE_PARTICLE_APP_ID!,
        authTypes: [AuthType.email, AuthType.google, AuthType.twitter, AuthType.github],
        themeType: "dark",

        // List the chains you want to include
        chains: [mainnet, polygon, testnet],

        // Optionally, switches the embedded wallet modal to reflect a smart account
        // erc4337: {
        //   name: "SIMPLE",
        //   version: "2.0.0",
        // },

        // You can prompt the user to set up extra security measures upon login or other interactions
        promptSettingConfig: {
          promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
          promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
        },

        wallet: {
          themeType: "dark", // Wallet modal theme

          // Set to false to remove the embedded wallet modal
          visible: true,
          customStyle: {
            supportUIModeSwitch: true,
            supportLanguageSwitch: false,
          },
        },
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
};
