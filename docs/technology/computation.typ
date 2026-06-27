#let astro = (
  title: "Computational Architecture",
  description: "The state of chips and computation in Luminous",
  type: "Technology",
  tags: ("computation", "cpu", "chips"),
)

= Computational Architecture

Luminous computers still use recognisable digital principles, but the hardware looks very different from early Earth machines. Materials engineering, fibre-optic signalling, and three-dimensional manufacturing moved most of the old motherboard layout into a single dense assembly.

== Computational Boards

Most devices are built around a unified computational board. Processor, graphics, memory, acceleration, and power systems are made as one bonded assembly. Long-term storage and external peripherals are usually the only detachable parts. A typical board contains:
- General Compute Array (CPU equivalent)
- Parallel Compute Array (GPU equivalent)
- Unified Memory Block
- Quantum Accelerator
- Neural Processing Units
- In-built PSU

The modules communicate through high-bandwidth fibre optics. Copper is kept to short local paths. This reduces wiring complexity and removes many of the bottlenecks that shaped motherboard-based computers.

== Photonic Communication

Major components exchange data through fibre-optic paths rather than copper conductors. Conductive materials still appear inside local processing structures, but longer routes inside the device are photonic. Advantages include:
- Extremely high bandwidth
- Low transmission losses
- Reduced electromagnetic interference
- Lower power consumption per transmitted bit
- Simplified scaling of large computational assemblies

Moving information between computational units uses far less energy than it did in historical Earth hardware.

== 3D Compute Structures

Modern Luminous processors are not flat silicon dies. Active logic fills a three-dimensional block. Processing regions communicate horizontally and vertically, so related systems can sit close together even when they perform different roles#footnote[Author note: this is inspired by recent real-world work on stacked chips. Current versions are still limited by heat, clock speed, quantum tunnelling, and manufacturing constraints.].

This shortens data paths and raises computational density. A block can hold processing, cache, memory, and acceleration systems inside the same physical volume.

== Thermal Equalisation Materials

Three-dimensional computing became practical after Luminous developed materials that spread heat quickly. In older processors, local hotspots limited performance long before the average device temperature became dangerous.

Modern computational materials spread thermal energy through the whole block. Cooling systems remove heat from the assembly as a whole instead of chasing individual hotspots.

This is one reason Luminous systems can sustain performance that older semiconductor designs could not.

== Clocking and Synchronisation

Luminous systems do not rely on a single global clock. As assemblies grew, signal delay became a bigger limit than transistor switching speed. Perfect synchronisation across the whole structure wasted too much energy.

Modern systems use locally synchronised regions connected by high-speed photonic networks. Each region computes independently and exchanges data with nearby regions as needed. The design lets systems grow without being held back by global clock distribution.

== Quantum Accelerators

Quantum computation sits inside the board as a specialised subsystem. Most boards include a small Quantum Accelerator for problems where quantum methods are worth the cost, mainly simulation and advanced machine learning.

== Performance Characteristics

Direct comparisons with historical Earth hardware are misleading.

Individual processing regions can run at very high frequencies, but overall performance mainly comes from:
- Massive parallelism
- Three-dimensional computational density
- Near-unified memory access
- High-bandwidth fibre optic communication
- Reduced thermal limitations
- Distributed architectures

The old line between processor, graphics processor, and memory is blurry. A modern board is an integrated computational block, not a collection of separate components. An early digital-era engineer would recognise many principles and still struggle to say where one module ends.
