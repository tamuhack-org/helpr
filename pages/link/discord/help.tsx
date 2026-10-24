import ConnectDiscord from "@/components/ui/connectDiscord";
import { useRouter } from "next/router";

// TODO: make this an prop input and get it from buzz
const inviteUrl = "https://discord.com/invite/fTTq42Qsz5";

export default function Help() {
  const { query } = useRouter();
  const retry = query.retry === "true";
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <section className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {retry? "Please join the server before attempting to connect discord.": "Receive notifications on discord about new tickets"}
        </h3>
        <p className="mb-6 text-gray-600">
          You need to be in the TAMUhack Discord server to receive help ticket
          alerts.
        </p>

        <ol className="space-y-6">
          <li>
            <div className="flex items-baseline gap-1">
              <h2 className="font-medium text-gray-900">1.</h2>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Join the TAMUhack Discord server
              </a>
            </div>
          </li>

          <li>
            <h2 className="mb-2 font-medium text-gray-900">
              2. Connect your Discord account
            </h2>
            <p className="mb-3 text-gray-600">
              Run the discord connection to verify and receive the mentor role.
            </p>
            <ConnectDiscord />
          </li>

          <li>
            <h2 className="mb-2 font-medium text-gray-900">
              3. Checking out
            </h2>
            <p className="mb-3 text-gray-600">
              Once you're done with your shift, use the /checkout command in the server to stop receiving notifications.
            </p>
          </li>
        </ol>
      </section>
    </main>
  );
}

