/* eslint-disable jsx-a11y/anchor-is-valid */
//@ts-nocheck
import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useAuth } from "../../hooks/auth";

const SignInPage: FC = function () {
  const{login} = useAuth();
  return (
    <div className="flex flex-col items-center justify-center px-6 lg:h-screen lg:gap-y-12">
      <div className="my-6 flex items-center gap-x-1 lg:my-0">
        <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
          RealNFTState
        </span>
      </div>
      <Card
        imgSrc="/NFT.jpeg"
        imgAlt=""
        className="w-full md:max-w-screen-sm [&>img]:w-full md:[&>img]:block md:[&>img]:p-0 md:[&>*]:w-full md:[&>*]:p-16"
      >
        <h1 className="mb-3 text-2xl font-bold dark:text-white md:text-3xl">
          Sign in to RealNFTState
        </h1>
        <form>
          <div className="mb-6">
            <Button onClick={()=>{login()}} className="w-full lg:w-auto">
              Login using Internet Identity
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SignInPage;
