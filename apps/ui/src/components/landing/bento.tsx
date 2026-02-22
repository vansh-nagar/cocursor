import BentoCodeSpeed from "./bento/bento-code-speed";
import BentoAgent from "./bento/bento-agent";
import BentoChat from "./bento/bento-chat";
import BentoCollab from "./bento/bento-collab";

const Bento = () => {
  return (
    <div className="min-h-[90vh] flex justify-center items-center py-10 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        <BentoCodeSpeed />

        <div className="grid grid-rows-1 md:grid-rows-2 gap-4 sm:gap-6 md:gap-8">
          <BentoAgent />
          <BentoChat />
        </div>

        <div className="hidden lg:flex">
          <BentoCollab />
        </div>
      </div>
    </div>
  );
};

export default Bento;
