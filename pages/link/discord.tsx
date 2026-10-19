import ConnectDiscord from "@/components/ui/connectDiscord"

// TODO: Look into how multiple helpr accounts mapping to same discord id would behave 
// Also check if theres already a discord id associated with this account, does linking with another overwrite?
export default function Discord(){
  return (
    <div>
      <ConnectDiscord />
    </div>
  )
}
