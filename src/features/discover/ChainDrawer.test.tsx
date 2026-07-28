import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CC } from '../../engine';
import { regionsOf, vpcsOf } from './discoveryModel';
import { attachmentChain, MAP_CLOUDS } from './attachmentModel';
import { ChainDrawer } from './ChainDrawer';
import type { Cloud } from './discoveryModel';

afterEach(cleanup);

const findVpc = (attached: boolean) => {
  for (const c of (CC.clouds as Cloud[]).filter(c => (MAP_CLOUDS as readonly string[]).includes(c.id))) {
    for (const r of regionsOf(CC, c.id)) {
      for (const v of vpcsOf(CC, r.id)) {
        if (v.attached === attached) return { cloudId: c.id, regionId: r.id, vpcId: v.id };
      }
    }
  }
  throw new Error(`no ${attached ? 'attached' : 'unattached'} vpc in seeds`);
};

describe('ChainDrawer — workload selection', () => {
  it('states the full chain for an attached workload: circuit, VLAN, both ASNs, path', () => {
    const w = findVpc(true);
    const chain = attachmentChain(CC, w.cloudId, w.regionId, w.vpcId)!;
    render(<ChainDrawer selection={{ kind: 'workload', ...w }} onClose={() => {}} />);
    expect(screen.getByText(chain.circuit!.name)).toBeInTheDocument();
    expect(screen.getByText(`VLAN ${chain.circuit!.vlan}`)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${chain.circuit!.bgp.customerAsn}.*${chain.circuit!.bgp.providerAsn}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${chain.path.latencyMs}\\s*ms`))).toBeInTheDocument();
  });

  it('an unattached workload ends at the internet and offers the real attach action', () => {
    const w = findVpc(false);
    const chain = attachmentChain(CC, w.cloudId, w.regionId, w.vpcId)!;
    expect(chain.circuit).toBeNull();
    render(<ChainDrawer selection={{ kind: 'workload', ...w }} onClose={() => {}} />);
    expect(screen.getByText(chain.internet!.egressNote)).toBeInTheDocument();
    const cta = screen.getByRole('button', { name: /attach via/i });
    fireEvent.click(cta);
    // Engine-real: the chain now derives a circuit from the SAME engine.
    const after = attachmentChain(CC, w.cloudId, w.regionId, w.vpcId)!;
    expect(after.circuit).not.toBeNull();
    // Restore the singleton for the rest of the suite.
    expect(CC.undo()).toBe(true);
  });
});

describe('ChainDrawer — on-ramp selection', () => {
  it('lists the circuit detail and every workload riding it', () => {
    render(<ChainDrawer selection={{ kind: 'onramp', onrampId: 'nb1' }} onClose={() => {}} />);
    const ramp = (CC.onramps as { id: string; name: string }[]).find(o => o.id === 'nb1')!;
    expect(screen.getByText(ramp.name)).toBeInTheDocument();
    expect(screen.getByTestId('ramp-workloads').children.length).toBeGreaterThan(0);
  });
});
