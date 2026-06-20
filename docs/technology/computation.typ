#let astro = (
  title: "Computational Architecture",
  description: "The state of chips and computation in Luminous",
  type: "Technology",
  tags: ("computation", "cpu", "chips"),
)

= Computational Architecture

Computing systems in Luminous differ substantially from those used during the early interplanetary period. While the underlying principles of digital computation remain recognisable, advances in materials science, photonic communication, and three-dimensional manufacturing have resulted in hardware architectures that bear little resemblance to traditional Earth computers.

== Computational Boards

Most computing devices are built around a unified computational board. Rather than containing separate processor, graphics, and memory modules connected through replaceable sockets, a computational board is manufactured as a single integrated assembly. The major computational components are permanently bonded together during fabrication and are intended to function as one cohesive system for the duration of the device's lifespan. Only long-term storage devices and external peripherals are routinely detachable. A typical board contains:
- General Compute Array (CPU equivalent)
- Parallel Compute Array (GPU equivalent)
- Unified Memory Block
- Quantum Accelerator
- Neural Processing Units
- In-built PSU

All of the modules of a computation board communicate using high-bandwidth fibre optics, and the whole assembly minimises copper communication where possible. This approach reduces physical complexity, increases communication bandwidth between components, and removes many of the bottlenecks associated with traditional motherboard-based designs.

== Photonic Communication

Most communication between major computational systems occurs using fibre optical pathways rather than metallic/copper conductors. While conductive materials are still used internally within local processing structures where appropriate, long-distance communication inside a device is predominantly photonic. Advantages include:
- Extremely high bandwidth
- Low transmission losses
- Reduced electromagnetic interference
- Lower power consumption per transmitted bit
- Simplified scaling of large computational assemblies

As a result, moving information between computational units consumes far less energy than was historically required on Earth.

== 3D Compute Structures

Modern Luminous processors are not manufactured as flat silicon dies. Instead, computational structures occupy three-dimensional volumes, with active logic distributed throughout the entire structure. Processing regions communicate both horizontally and vertically, allowing physical proximity between related computational systems regardless of their functional role#footnote[Author note: this is inspired by the recent developments in real life, where companies like Huawei have proven that this is possible, but is still limited by bottlenecks or impossible due to other factors like heat, clock speed, quantum tunnelling, etc.].

This architecture significantly reduces communication distances between processing elements and allows substantially greater computational density than planar designs. A computational block may contain processing, cache, memory, and acceleration systems interwoven throughout the same physical volume rather than separated into distinct layers or components.

== Thermal Equalisation Materials

The transition to fully three-dimensional computing was enabled by the development of engineered materials capable of rapid thermal equalisation. In traditional processors, localised hotspots limited performance long before the device's average temperature became problematic. Computational density could only increase so far due to cooling issues.

Modern computational materials distribute thermal energy throughout the entire structure with extremely high efficiency. Heat introduced in one region rapidly spreads throughout the whole computational block, preventing the formation of significant hotspots. Cooling systems therefore remove heat from the assembly as a whole rather than targeting individual regions.

This capability is one of the primary reasons modern computational systems can sustain performance levels that would have been impractical using historical semiconductor technologies.

== Clocking and Synchronisation

Luminous computational systems generally do not rely on a single global clock. As computational assemblies increased in physical size and complexity, signal propagation delays became a greater limitation than transistor switching speeds. Maintaining perfect synchronisation across an entire computational structure became severely inefficient.

Modern systems operate as collections of locally synchronised regions connected through high-speed photonic communication networks. Each region performs computation independently while exchanging information with neighbouring regions as required. This architecture improves scalability and allows computational systems to continue growing without being limited by the limitations of global clocks and clock distribution.

== Quantum Accelerators

Quantum computation exists as a specialised subsystem within a computation board and works alongside all of the other modules and components. Most computational boards contain a small Quantum Accelerator designed to solve specific classes of problems where quantum approaches offer substantial advantages. They are typically used for simulation and advanced machine learning workloads.

== Performance Characteristics

Comparisons with historical Earth hardware are generally misleading.

While individual processing regions may operate at frequencies that would have been considered exceptionally high during the early twenty-first century, overall system performance is derived primarily from:
- Massive parallelism
- Three-dimensional computational density
- Near-unified memory access
- High-bandwidth fibre optic communication
- Reduced thermal limitations
- Distributed architectures

As a result, the distinction between processor, graphics processor, and memory has become increasingly blurry. Modern computational boards are best understood as integrated computational blocks rather than collections of separate components. An engineer from the early digital era would recognise many of the underlying principles, but would likely struggle to identify where one module ends and another begins.
