import ConnectDiscord from "@/components/ui/connectDiscord"

// TODO: Look into how multiple helpr accounts mapping to same discord id would behave 
// Also check if theres already a discord id associated with this account, does linking with another overwrite?
export default function Discord(){
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
      <p className="text-gray-600">Connect to receive notifications on discord!</p>
      <ConnectDiscord />
    </div>
  )
}
