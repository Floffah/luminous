#import "_template.typ": *

// Take a look at the file `template.typ` in the file panel
// to customize this template and discover how it works.
#show: project.with(
  title: "Luminous",
  authors: (
    (name: "Ramsay", affiliation: "Floffah"),
  ),
)

// Overview
#include "luminous/index.typ"

// History, in chronological order
#include "history/index.typ"
#include "history/discovery.typ"
#include "history/withdrawal.typ"
#include "history/stabilisation.typ"
#include "history/anomalies.typ"
#include "history/first-contact.typ"
#include "history/sit-in-it.typ"

// Places: the capital planet, its cities, then other locations
#include "luminous/emergence.typ"
#include "luminous/haven.typ"
#include "luminous/arden.typ"
#include "luminous/kera.typ"
#include "luminous/lowtide.typ"
#include "luminous/solace.typ"
#include "luminous/vale.typ"

// Government and its agencies
#include "government/agencies/military.typ"
#include "government/agencies/outreach.typ"

// People
#include "people/randall-paints.typ"
