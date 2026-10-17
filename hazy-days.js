const VALID_REGIONS = 
  [ "west",
    "east", 
    "north", 
    "south", 
    "central" ]

const inputRegion = (args.widgetParameter || "west").trim().toLowerCase()

const REGION = VALID_REGIONS.includes(inputRegion) ? inputRegion : "west"

let req = new Request( "https://api-open.data.gov.sg/v2/real-time/api/psi" )
let json = await req.loadJSON()

let latest = json.data.items[0] 
let readings = latest.readings

let psi = readings.psi_twenty_four_hourly[REGION] 

function getStatus(psi) { 
  if (psi <= 50) 
    return "GOOD"
  if (psi <= 100) 
    return "MODERATE"
  if (psi <= 200)
    return "UNHEALTHY"
  if (psi <= 300) 
    return "VERY UNHEALTHY" 
  return "HAZARDOUS" 
}

// ───── creating widget ─────

let widget = new ListWidget()
const DARK_BLUE = new Color("#173A5E")

// ───── background image ─────

let backgroundName

if (psi <= 50) { 
  backgroundName = "good.png" 
}
else if (psi <= 100) { 
  backgroundName = "moderate.png"
} 
else if (psi <= 200) { 
  backgroundName = "unhealthy.png" 
} 
else if (psi <= 300) { 
  backgroundName = "very.png" 
} 
else { 
  backgroundName = "hazardous.png" 
}

let fm = FileManager.local()

let path = fm.joinPath(
  fm.documentsDirectory(),
  backgroundName
)

if (fm.fileExists(path)) {
  widget.backgroundImage = fm.readImage(path)
}

widget.setPadding(9, 14, 12, 14)

// ───── top ─────

let topRow = widget.addStack() 
topRow.layoutHorizontally()

let title = topRow.addText("HAZE") 
title.font = Font.boldSystemFont(12) 
title.textColor = DARK_BLUE

topRow.addSpacer()

let region = topRow.addText(REGION.toUpperCase()) 
region.font = Font.boldSystemFont(11) 
region.textColor = DARK_BLUE

// ───── psi ─────

let psiRow = widget.addStack() 
psiRow.layoutHorizontally()

psiRow.addSpacer()

let number = psiRow.addText(`${psi}`) 
number.font = Font.boldSystemFont(32) 
number.textColor = DARK_BLUE

psiRow.addSpacer()

// ───── status ─────

let statusRow = widget.addStack() 
statusRow.layoutHorizontally()

statusRow.addSpacer()

let status = statusRow.addText(getStatus(psi)) 
status.font = Font.boldSystemFont(11) 
status.textColor = DARK_BLUE

statusRow.addSpacer()

// ───── time ─────

widget.addSpacer(1)

let timeRow = widget.addStack() 
timeRow.layoutHorizontally()

timeRow.addSpacer()

const updatedTime = new Date(latest.updatedTimestamp)

let formatter = new DateFormatter() 
formatter.useShortTimeStyle()

let date = timeRow.addText( 
  `Updated ${formatter.string(updatedTime)}`
)

date.font = Font.systemFont(9) 
date.textColor = DARK_BLUE

timeRow.addSpacer() 
widget.addSpacer()

widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)

if (!config.runsInWidget) { 
  await widget.presentSmall() 
}

Script.setWidget(widget) 
Script.complete()
