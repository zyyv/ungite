import { getAllBranches } from "./utils";


export function ui(cwd = process.cwd()){
  
}


export async  function branchUI(cwd = process.cwd()){
  const branches = await getAllBranches()
  console.log({ branches })
}
